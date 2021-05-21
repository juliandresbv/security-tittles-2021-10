var _ = require('underscore');
const crypto = require('crypto');
const mongo = require('../mongodb/mongo')
const {
  sendTransaction,
  getAddress,
  sendTransactionWithAwait,
  queryState } = require('../sawtooth/sawtooth-helpers')

const Atribute = require('../models/Atribute');

const hash512 = (x) =>
  crypto.createHash('sha512').update(x).digest('hex');

const TRANSACTION_FAMILY = 'todo';
const TRANSACTION_FAMILY_VERSION = '1.0';
const INT_KEY_NAMESPACE = hash512(TRANSACTION_FAMILY).substring(0, 6)

const { default: axios } = require("axios");
const fs = require('fs');
const { reject } = require('underscore');

function buildAddress(transactionFamily) {
  return (key) => {
    return getAddress(transactionFamily, key);
  }
}

const address = buildAddress(TRANSACTION_FAMILY);


const ledgerUrl = process.env.APPORG0APP2_PORT && new URL(process.env.APPORG0APP2_PORT);
const LEDGER_HOST_PORT = ledgerUrl && `${ledgerUrl.hostname}:${ledgerUrl.port}`;

module.exports.getResumen = async function (req, res) {

  mongo.client().db('mydb').atribute.insertOne({
    name: "Prueba", value: "prueba", type: "STRING"
  })

  const at = new Atribute({
    name: "Prueba",
    value: "prueba",
    type: "STRING"
  })
  at.save().catch(err => console.log(err))
}

module.exports.getDashboard = async function (req, res) {

  var interfaz = []


  var respuesta = {
    balanceCheques:  await getBalanceClient(req.auth.jwt.publicKey),
    chequesDisponibles: 0,
    cheques: [],
  }
  const services = mongo.client().db('mydb').collection('service').find({ "id": { $in: req.query.services } });
  await new Promise((resolve, reject) => {
    services.forEach((s) => {
      const serv = {
        _id: s._id,
        id: s.id,
        name: s.name,
        dashboard: s.dashboard
      }
      interfaz.push(serv)
    },
      resolve)

  })

  const enviados2 = mongo.client().db('mydb').collection("todo_transaction").aggregate([
    {
      $lookup: {
        from: "todo_transaction",
        localField: "_id",
        foreignField: "input",
        as: "chequesEnviados"
      }
    },
    { $match: { 'deco.owner': req.auth.jwt.publicKey, 'deco.servicio.estado': 'En Poseción', chequesEnviados: [] } }
  ])
  await new Promise((resolve, reject) => {
    enviados2.forEach((doc) => {
      console.log(respuesta.balanceCheques)
      respuesta.chequesDisponibles += 1
    },
      resolve)
  });

  const recibidos = mongo.client().db('mydb').collection("todo_state").aggregate([
    {
      $lookup: {
        from: "todo_transaction",
        localField: "_id",
        foreignField: "_id",
        as: "chequesRecibidos"
      }
    },
    { $match: { 'value.owner': req.auth.jwt.publicKey, 'value.servicio.estado': { $ne: 'En Poseción' } } }
  ])
  await new Promise((resolve, reject) => {
    recibidos.forEach((doc) => {
      const payload = JSON.parse(doc.chequesRecibidos[0].payload)
      console.log(respuesta.balanceCheques)
      respuesta.balanceCheques = respuesta.balanceCheques + payload.titulo.valorNumeros
      respuesta.cheques.push({
        identificador: doc._id,
        tipo: "Recibido",
        valorNumeros: payload.titulo.valorNumeros,
      });
    },
      resolve)
  });

  const enviados = mongo.client().db('mydb').collection("todo_transaction").aggregate([
    {
      $lookup: {
        from: "todo_transaction",
        localField: "_id",
        foreignField: "input",
        as: "chequesEnviados"
      }
    },
    { $match: { 'deco.owner': req.auth.jwt.publicKey, 'chequesEnviados.idx': 1 } }
  ])
  await new Promise((resolve, reject) => {
    enviados.forEach((doc) => {

      
      const payload = JSON.parse(doc.chequesEnviados[0].payload)
      if (payload.output.servicio.estado === "Activo" || payload.output.servicio.estado === "Endosado") {
        console.log(respuesta.balanceCheques)
        respuesta.balanceCheques = respuesta.balanceCheques - payload.titulo.valorNumeros
      }
      respuesta.cheques.push({
        identificador: doc._id,
        tipo: "Expedido",
        valorNumeros: payload.titulo.valorNumeros,
      });
    },
      resolve)
  });

  var data = respuesta


  res.send({ interfaz: interfaz, data: {data}})
}

module.exports.getResumen = async function (req, res) {
  const service = await mongo.client().db('mydb').collection('service').findOne({ "id": req.query.service });
  const interfaz = {
    _id: service._id,
    id: service.id,
    name: service.name,
    resume: service.resume
  }
  if (req.query.service === "titulo-001") {
    var respuesta = {
      fondosDisponibles: 0,
      fondosGirados: 0,
      chequesDisponibles: 0,
      chequesGirados: [],
      chequesRecibidos: [],
    }

    respuesta.fondosDisponibles = await getBalanceClient(req.auth.jwt.publicKey)
    const recibidos = mongo.client().db('mydb').collection("todo_state").aggregate([
      {
        $lookup: {
          from: "todo_transaction",
          localField: "_id",
          foreignField: "_id",
          as: "chequesRecibidos"
        }
      },
      { $match: { 'value.owner': req.auth.jwt.publicKey, 'value.servicio.estado': { $ne: 'En Poseción' } } }
    ])
    await new Promise((resolve, reject) => {
      recibidos.forEach((doc) => {
        const payload = JSON.parse(doc.chequesRecibidos[0].payload)

        respuesta.chequesRecibidos.push({
          identificador: doc._id,
          tipo: payload.titulo.tipo,
          valorNumeros: payload.titulo.valorNumeros,
          estado: payload.output.servicio.estado
        });

      },
        resolve)
    });

    const enviados = mongo.client().db('mydb').collection("todo_transaction").aggregate([
      {
        $lookup: {
          from: "todo_transaction",
          localField: "_id",
          foreignField: "input",
          as: "chequesEnviados"
        }
      },
      { $match: { 'deco.owner': req.auth.jwt.publicKey, 'chequesEnviados.idx': 1 } }
    ])
    await new Promise((resolve, reject) => {
      enviados.forEach((doc) => {

        
        const payload = JSON.parse(doc.chequesEnviados[0].payload)
        if (payload.output.servicio.estado === "Activo" || payload.output.servicio.estado === "Endosado") {
          respuesta.fondosGirados += payload.titulo.valorNumeros
        }
        respuesta.chequesGirados.push({
          identificador: doc._id,
          tipo: payload.titulo.tipo,
          valorNumeros: payload.titulo.valorNumeros,
          estado: payload.output.servicio.estado
        });
      },
        resolve)
    });

    const enviados2 = mongo.client().db('mydb').collection("todo_transaction").aggregate([
      {
        $lookup: {
          from: "todo_transaction",
          localField: "_id",
          foreignField: "input",
          as: "chequesEnviados"
        }
      },
      { $match: { 'deco.owner': req.auth.jwt.publicKey, 'deco.servicio.estado': 'En Poseción', chequesEnviados: [] } }
    ])
    await new Promise((resolve, reject) => {
      enviados2.forEach((doc) => {
        respuesta.chequesDisponibles += 1
      },
        resolve)
    });
    data = respuesta
  }

  res.send({ interfaz: interfaz, data: data })
}

async function getBalanceClient(id) {

  const user = await mongo.client().db('mydb').collection("auth_state").findOne({ "_id": id });
  return user.value.balance

}

module.exports.getCreate = async function (req, res) {

  console.log(req.query.rol)
  const service = await mongo.client().db('mydb').collection('service').findOne({ "id": req.query.service });
  let interfaz
  let data
  service.create.forEach(c => {
    if (c.rol === req.query.rol) {
      interfaz = c
    }
  })
  if (req.query.service === "titulo-001") {
    var respuesta = {
      fondosDisponibles: 0,
      fondosGirados: 0,
      chequesDisponibles: 0,
      title: {}
    }
    respuesta.fondosDisponibles = await getBalanceClient(req.auth.jwt.publicKey)



    const enviados2 = mongo.client().db('mydb').collection("todo_transaction").aggregate([
      {
        $lookup: {
          from: "todo_transaction",
          localField: "_id",
          foreignField: "input",
          as: "chequesEnviados"
        }
      },
      { $match: { 'deco.owner': req.auth.jwt.publicKey, 'deco.servicio.estado': 'En Poseción', chequesEnviados: [] } }
    ])
    await new Promise((resolve, reject) => {
      enviados2.forEach((doc) => {
        respuesta.title = doc
        respuesta.chequesDisponibles += 1
      },
        resolve)
    });

    const enviados = mongo.client().db('mydb').collection("todo_transaction").aggregate([
      {
        $lookup: {
          from: "todo_transaction",
          localField: "_id",
          foreignField: "input",
          as: "chequesEnviados"
        }
      },
      { $match: { 'deco.owner': req.auth.jwt.publicKey, 'chequesEnviados.idx': 1 } }
    ])
    await new Promise((resolve, reject) => {
      enviados.forEach((doc) => {

        //console.log(doc)
        const payload = JSON.parse(doc.chequesEnviados[0].payload)
        if (payload.output.servicio.estado === "Activo" || payload.output.servicio.estado === "Endosado") {
          respuesta.fondosGirados += payload.titulo.valorNumeros
        }
      },
        resolve)
    });
    data = respuesta
  }

  res.send({ interfaz: interfaz, data: data })
}

module.exports.getAllServices = async function (req, res) {
  var data = []
  const services = mongo.client().db('mydb').collection('service').find();
  await new Promise((resolve, reject) => {
    services.forEach((s) => {
      const serv = {
        _id: s._id,
        id: s.id,
        name: s.name,
        cost: s.cost
      }
      data.push(serv)
    },
      resolve)

  })
  res.send(data)
}

module.exports.getAllToDo = async function (req, res) {

  var respuesta = {
    fondosDisponibles: 2000000,
    fondosGirados: 50000,
    chequesDisponibles: 10,
    chequesGirados: [],
    chequesRecibidos: [],
  }

  const stateCollection = mongo.client().db('mydb').collection("todo_state");
  const transactions = mongo.client().db('mydb').collection("todo_transaction");

  const page = req.query.page || 0;

  const cursor = stateCollection.find({ "value.owner": req.auth.jwt.publicKey, "value.servicio.estado": { $ne: 'POSECION' } })
    .skip(PAGE_SIZE * page)
    .limit(PAGE_SIZE);

  let todos1 = [];
  await new Promise((resolve, reject) => {
    cursor.forEach((doc) => {
      respuesta.chequesRecibidos.push(doc);
    },
      resolve)
  });
  const tx = transactions.find({ "deco.owner": req.auth.jwt.publicKey, "idx": 0 })
    .skip(PAGE_SIZE * page)
    .limit(PAGE_SIZE);

  let todos2 = [];
  await new Promise((resolve, reject) => {
    tx.forEach((doc) => {
      const payload = JSON.parse(doc.payload)

      var titulo = {
        identificador: doc._id,
        tipo: payload.titulo.tipo,
        valorNumeros: payload.titulo.valorNumeros,
        estado: payload.output.servicio.estado
      }
      respuesta.chequesGirados.push(titulo);
    },
      resolve)
  });
  res.json(respuesta);
};


module.exports.getAllToDoTipo = async function (req, res) {

  const stateCollection = mongo.client().db('mydb').collection("todo_state");
  const transactions = mongo.client().db('mydb').collection("todo_transaction");

  const page = req.query.page || 0;

  const cursor = stateCollection.find({ "value.owner": req.auth.jwt.publicKey, "value.estado": { $ne: 'POSECION' } })
    .skip(PAGE_SIZE * page)
    .limit(PAGE_SIZE);

  let todos = [];
  await new Promise((resolve, reject) => {
    cursor.forEach((doc) => {
      todos.push(doc);
    },
      resolve)
  });

  let owner = req.auth.jwt.publicKey
  const tx = transactions.find({ "deco.output.owner": req.auth.jwt.publicKey, "idx": 0 })
    .skip(PAGE_SIZE * page)
    .limit(PAGE_SIZE);

  await new Promise((resolve, reject) => {
    tx.forEach((doc) => {
      todos.push(doc);
    },
      resolve)
  });

  res.json(todos);

};


module.exports.getToDo = async function (req, res) {
  const stateCollection = mongo.client().db('mydb').collection("todo_state");
  const transactions = mongo.client().db('mydb').collection("todo_transaction");

  const value = await stateCollection.findOne({ "_id": req.params.id });
  if (!value) {
    return res.status(404).json("not found");
  }
  const r = await transactions.findOne({ "_id": req.params.id })
  const a = await transactions.findOne({ "root": r.root, "idx": 1 })
  const b = await transactions.findOne({ "root": r.root, "idx": 0 })

  let rol = ""
  var nombreLibrador
  var idLibrador
  var nombreBeneficiario
  var idBeneficiario

  if (b.deco.owner === req.auth.jwt.publicKey) {
    rol = "librador"
    var public = JSON.parse(a.payload);
    var temp =  mongo.client().db('mydb').collection("auth_state").findOne({"value.id": public.titulo.idBeneficiario})
    idBeneficiario = public.titulo.idBeneficiario
    nameBeneficiario = temp.value.name
  }
  else {
    rol = "beneficiario"
    var temp = await mongo.client().db('mydb').collection("auth_state").findOne({_id: b.deco.owner})
    nombreLibrador = temp.value.name
    idLibrador = temp.value.id
    var public = JSON.parse(a.payload);
    idBeneficiario = public.titulo.idBeneficiario
    var temp =  await mongo.client().db('mydb').collection("auth_state").findOne({"value.id": public.titulo.idBeneficiario})
    nombreBeneficiario = temp.value.name
  }



  const service = await mongo.client().db('mydb').collection("service").findOne({ "id": req.params.service })
  let detail

  if (!service) {
    return res.status(404).json("not found");
  }
  else {

    service.details.map(d => {
      if (d.rol === rol && d.state === value.value.servicio.estado) {
        detail = d
      }
    })
  }

  var ultimaTran = JSON.parse(r.payload);
  var primeraTran = JSON.parse(a.payload);

  var cadenaEndosos = await getToDoHistory(req.params.id)

  return res.json({
    interfaz: detail,
    data: {
      idBeneficiario: idBeneficiario,
      nombreBeneficiario: nombreBeneficiario,
      ...primeraTran.titulo, 
      nombreLibrador: nombreLibrador, 
      idLibrador: idLibrador, 
      identificador: ultimaTran.input, 
      output: ultimaTran.output, 
      state: ultimaTran.output.servicio.estado, 
      cadenaEndosos: cadenaEndosos
    }
  });
}

module.exports.postServiceClient = async function (req, res) {

  const { transaction, txid } = req.body;

  const postTodoTxReq = await axios.post(
    `http://${LEDGER_HOST_PORT}/api/transaction`,
    req.body
  );

  return res.send('ok');
}


module.exports.postToDo = async function (req, res) {
  const { transaction, txid } = req.body;

  const postTodoTxReq = await axios.post(
    `http://${LEDGER_HOST_PORT}/api/transaction`,
    req.body
  );

  return res.send('ok');
};

module.exports.putToDo = async function (req, res) {
  const { transaction, txid } = req.body;
  const input = getAddress(TRANSACTION_FAMILY, JSON.parse(transaction).input);
  const address = getAddress(TRANSACTION_FAMILY, txid);

  const payload = JSON.stringify({ func: 'put', args: { transaction, txid } });

  try {
    await sendTransactionWithAwait([
      {
        transactionFamily: TRANSACTION_FAMILY,
        transactionFamilyVersion: TRANSACTION_FAMILY_VERSION,
        inputs: [input, address],
        outputs: [input, address],
        payload
      }
    ]);

    return res.json({ msg: 'ok' });

  }
  catch (err) {
    let errMsg;
    if (err.data) {
      errMsg = err.data;
      if (err.message == 'Invalid transaction') {
        errMsg = "Invalid Transaction: " + err.data.data[0].invalid_transactions[0].message;
      }
      else {
        errMsg = err;
      }
    }
    else {
      errMsg = err;
    }
    return res.status(500).json({ msg: errMsg });
  }
};

const PAGE_SIZE = (process.env.PAGE_SIZE) ? parseInt(process.env.PAGE_SIZE) : 10;


async function getToDoHistory(id) {

  const transactionCollection = mongo.client().db('mydb').collection("todo_transaction");
  const stateCollection = mongo.client().db('mydb').collection("todo_state");

  const st = await stateCollection.findOne({ _id: id });
  if (!st) {
    return res.status(404).json({ msg: "not UTXO" });
  }

  const tx = await transactionCollection.findOne({ _id: id });
  if (!tx) {
    return res.status(404).json({ msg: "Transaction not found" });
  }

  let history = [];
  const cursor = await transactionCollection.find({ root: tx.root })
    .sort({ block_num: -1 })
  await new Promise((resolve, reject) => {
    cursor.forEach((doc) => {
      var temp =  mongo.client().db('mydb').collection("auth_state").findOne({"_id": doc.deco.owner})
      history.push({ state: doc.deco.servicio.estado, owner:  doc.deco.owner});
    },
      resolve)
  });
  return history;
}

/*
module.exports.getToDoHistory = async function (req, res) {

  const page = req.query.page || 0;

  const transactionCollection = mongo.client().db('mydb').collection("todo_transaction");
  const stateCollection = mongo.client().db('mydb').collection("todo_state");

  const st = await stateCollection.findOne({ _id: req.params.id });
  if (!st) {
    return res.status(404).json({ msg: "not UTXO" });
  }

  const tx = await transactionCollection.findOne({ _id: req.params.id });
  if (!tx) {
    return res.status(404).json({ msg: "Transaction not found" });
  }

  let history = [];
  const cursor = await transactionCollection.find({ root: tx.root })
    .sort({ block_num: -1 })
    .skip(PAGE_SIZE * page)
    .limit(PAGE_SIZE);
  await new Promise((resolve, reject) => {
    cursor.forEach((doc) => {
      history.push(doc);
    },
      resolve)
  });
  return res.json(history);
} */