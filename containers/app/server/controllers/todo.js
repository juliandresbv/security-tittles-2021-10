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

module.exports.getResumen = async function (req, res) {

  console.log("aaaaaaaaaaaaaa")
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

function addService(service) {
  mongo.client().db('mydb').collection('service').insertOne(service)
  mongo.client().db('mydb').collection('service').insertOne({
    name: 'Cheques',
    id: 'titulo-001',
    create: [
        {
            name: 'Girar cheque',
            rol: 'librador',
            information: [
                {
                    type: 'INFORMATION',
                    name: 'Fondos Disponibles',
                    value: 'fondosDisponibles',
                    valueType: 'CURRENCY',
                    icon: 'WALLET',
                    size: 4,
                    color: 'GREEN'
                },
                {
                    type: 'INFORMATION',
                    name: 'Fondos Girados',
                    value: 'fondosGirados',
                    valueType: 'CURRENCY',
                    icon: 'WALLET',
                    size: 4,
                    color: 'BLUE'
                },
                {
                    type: 'INFORMATION',
                    name: 'Cheques Disponibles',
                    value: 'chequesDisponibles',
                    valueType: 'NUMBER',
                    icon: 'BILL',
                    size: 2
                }
            ],
            components: [
                {
                    type: 'INPUT',
                    name: 'Girar cheque',
                    message: '',
                    inputs: [
                        {
                            name: 'Paguese a:',
                            placeholder: 'Cédula del beneficiario',
                            size: 2,
                            'default': '',
                            maxLength: 20,
                            atribute: {
                                name: 'Identificación beneficiario',
                                value: 'idBeneficiario',
                                type: 'STRING'
                            }
                        },
                        {
                            name: 'Tipo de identificación beneficiario',
                            placeholder: '',
                            size: 2,
                            'default': 'Tipo de documento',
                            maxLength: 20,
                            atribute: {
                                name: 'Tipo de identificación beneficiario',
                                value: 'tipoIdBeneficiario',
                                type: 'SELECT'
                            },
                            list: [
                                {
                                    label: 'Cédula de ciudadanía',
                                    value: 'CC'
                                },
                                {
                                    label: 'Cédula de estranjería',
                                    value: 'CE'
                                },
                                {
                                    label: 'Pasaporte',
                                    value: 'PS'
                                }
                            ]
                        },
                        {
                            name: 'La suma de:',
                            placeholder: 'Suma total del cheque en números',
                            size: 2,
                            'default': '',
                            maxLength: 20,
                            atribute: {
                                name: 'Valor en números',
                                value: 'valorNumeros',
                                type: 'CURRENCY'
                            }
                        },
                        {
                            name: 'Valor en letras:',
                            placeholder: 'Suma total del cheque en letras',
                            size: 2,
                            'default': '',
                            maxLength: 20,
                            atribute: {
                                name: 'Valor en letras',
                                value: 'valorLetras',
                                type: 'STRING'
                            }
                        },
                        {
                            name: 'Tipo de cheque:',
                            placeholder: '',
                            size: 2,
                            'default': 'Elige una opción',
                            maxLength: 20,
                            atribute: {
                                name: 'Tipo de cheque',
                                value: 'tipo',
                                type: 'SELECT'
                            },
                            list: [
                                {
                                    label: 'General',
                                    value: 'General'
                                },
                                {
                                    label: 'Abono en cuenta',
                                    value: 'Abono en cuenta'
                                },
                                {
                                    label: 'No negociable',
                                    value: 'No negociable'
                                },
                                {
                                    label: 'Fiscal',
                                    value: 'Fiscal'
                                }
                            ]
                        },
                        {
                            name: 'Fecha de vencimiento:',
                            placeholder: 'Fecha de vencimiento del cheque',
                            size: 2,
                            'default': '',
                            maxLength: 20,
                            atribute: {
                                name: 'Fecha de vencimiento',
                                value: 'fechaVencimiento',
                                type: 'DATE'
                            }
                        }
                    ]
                },
                {
                    type: 'BUTTON',
                    name: 'Firma electrónica',
                    message: 'Antes de firmar, por favor revisar cuidadosamente la información del cheque',
                    inputs: [
                        {
                            name: 'Ingrése su cédula:',
                            placeholder: 'Cédula del beneficiario',
                            size: 2,
                            'default': '',
                            maxLength: 20,
                            atribute: {
                                name: 'Firma',
                                value: 'firma',
                                type: 'SIGN'
                            }
                        }
                    ],
                    buttons: [
                        {
                            value: 'Girar cheque',
                            type: 'BLUE',
                            action: 'create'
                        },
                        {
                            value: 'Cancelar',
                            type: 'ORANGE',
                            action: 'back'
                        }
                    ]
                }
            ]
        }
    ],
    resume: {
        information: [
            {
                type: 'INFORMATION',
                name: 'Fondos Disponibles',
                value: 'fondosDisponibles',
                valueType: 'CURRENCY',
                icon: 'WALLET',
                size: 3,
                color: 'GREEN'
            },
            {
                type: 'INFORMATION',
                name: 'Fondos Girados',
                value: 'fondosGirados',
                valueType: 'CURRENCY',
                icon: 'WALLET',
                size: 3,
                color: 'BLUE'
            },
            {
                type: 'BUTTON',
                name: 'Cheques Disponibles',
                value: 'chequesDisponibles',
                valueType: 'NUMBER',
                icon: 'BILL',
                size: 4,
                buttons: [
                    {
                        value: 'Usar cheque',
                        type: 'ORANGE',
                        action: 'librador',
                        service: 'Cheques'
                    }
                ]
            }
        ],
        lists: [
            {
                name: 'Cheques Girados',
                value: 'chequesGirados',
                maxCapacity: 5,
                button: {
                    value: 'Ver más',
                    type: 'ORANGE',
                    action: 'list',
                    service: 'Cheques'
                },
                columns: [
                    {
                        name: 'Número de cheque',
                        value: 'identificador',
                        type: 'STRING',
                        maxLength: 15
                    },
                    {
                        name: 'Tipo de cheque',
                        value: 'tipo',
                        type: 'STRING',
                        maxLength: 15
                    },
                    {
                        name: 'Valor',
                        value: 'valorNumeros',
                        type: 'CURRENCY',
                        maxLength: 15
                    },
                    {
                        name: 'Estado',
                        value: 'estado',
                        type: 'STATE',
                        maxLength: 15
                    }
                ]
            },
            {
                name: 'Cheques Recibidios',
                value: 'chequesRecibidos',
                maxCapacity: 5,
                button: {
                    value: 'Ver más',
                    type: 'ORANGE',
                    action: 'list',
                    service: 'Cheques'
                },
                columns: [
                    {
                        name: 'Número de cheque',
                        value: 'identificador',
                        type: 'STRING',
                        maxLength: 15
                    },
                    {
                        name: 'Tipo de cheque',
                        value: 'tipo',
                        type: 'STRING',
                        maxLength: 15
                    },
                    {
                        name: 'Valor',
                        value: 'valorNumeros',
                        type: 'CURRENCY',
                        maxLength: 15
                    },
                    {
                        name: 'Estado',
                        value: 'estado',
                        type: 'STATE',
                        maxLength: 15
                    }
                ]
            }
        ],
        states: [
            {
                state: 'Pagado',
                color: '#9cff99'
            },
            {
                state: 'Endosado',
                color: '#97d5ff'
            },
            {
                state: 'Activo',
                color: '#e2e2e2'
            },
            {
                state: 'Caducado',
                color: '#ff9e9e'
            }
        ]
    },
    dashboard: {
        information: {
            type: 'SIMPLE',
            name: 'Balance de fondos de cheques',
            value: 'balanceCheques',
            valueType: 'CURRENCY',
            icon: 'BANK',
            size: 1,
            secondaryName: 'Cheques Disponibles',
            secondaryValue: 'chequesDisponibles',
            secondaryValueType: 'NUMBER'
        },
        list: {
            name: 'Historial de cheques',
            value: 'historialCheques',
            maxCapacity: 10,
            columns: [
                {
                    name: 'Número de cheque',
                    value: 'identificador',
                    type: 'STRING',
                    maxLength: 15
                },
                {
                    name: 'Tipo de cheque',
                    value: 'tipo',
                    type: 'STATE',
                    maxLength: 15
                },
                {
                    name: 'Valor',
                    value: 'valorNumeros',
                    type: 'CURRENCY',
                    maxLength: 15
                },
                {
                    name: 'Fecha',
                    value: 'fechaCreacion',
                    type: 'DATE',
                    maxLength: 15
                }
            ]
        },
        states: [
            {
                state: 'Expedido',
                color: '#9cff99'
            },
            {
                state: 'Recibido',
                color: '#97d5ff'
            }
        ]
    }
  })
}

module.exports.getDashboard = async function (req, res) {
  
  
  var interfaz = []
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
  res.send({ interfaz: interfaz, data: {} })
}

module.exports.getResumen = async function (req, res) {
  console.log(req.query.service)
  const service = await mongo.client().db('mydb').collection('service').findOne({ "id": req.query.service });
  const interfaz = {
    _id: service._id,
    id: service.id,
    name: service.name,
    resume: service.resume
  }
  res.send({ interfaz: interfaz, data: {} })
}

module.exports.getCreate = async function (req, res) {

  console.log(req.query.rol)
  const service = await mongo.client().db('mydb').collection('service').findOne({ "id": req.query.service});
  let interfaz
  service.create.forEach(c => {
    if (c.rol === req.query.rol){
      interfaz = c
    }
  })
  res.send({ interfaz: interfaz, data: {} })
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
  const a = await transactions.findOne({ "root": r.root, "idx": 0 })

  var ultimaTran = JSON.parse(r.payload);
  var primeraTran = JSON.parse(a.payload);

  return res.json({
    ...primeraTran, input: ultimaTran.input, output: ultimaTran.output
  });
}


module.exports.postToDo = async function (req, res) {
  const { transaction, txid } = req.body;

  const postTodoTxReq = await axios.post(
    `${process.env.LEDGER_API_HOST}:${process.env.LEDGER_API_PORT}/api/transaction`,
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
}