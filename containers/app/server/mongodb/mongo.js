const { MongoClient } = require("mongodb");

let client;

module.exports.init = async function(){
  if(client){
    throw new Error('Trying to initialize twice!!');
  }
  console.log('mongo uri:', process.env.MONGO_URI);
  client = new MongoClient(process.env.MONGO_URI, { useUnifiedTopology: true });
  await client.connect();

  // Establish and verify connection
  await client.db("admin").command({ ping: 1 });
};

module.exports.client = () => {
  return client;
};

module.exports.close = async function(){
  if(client){
    await client.close();
    client = null;
    console.log('Close MongoDB');
  }
  else{
    console.log('Trying to close closed connection')
  }
};


module.exports.createIndexes = async function(){
  const db = client.db('mydb');
  try{
    await db.collection('block').createIndex({block_num: 1});
    await db.collection('todo_transaction').createIndex({block_num: 1});
    await db.collection('todo_transaction').createIndex({head_id: 1, idx: -1});

    await db.collection('todo_state_history').createIndex({key: 1, block_num: 1}, {unique: true});
    await db.collection('todo_state_history').createIndex({address: 1, key: 1, block_num: 1});

    await db.collection('todo_state').createIndex({"value.owner": 1});
    /* await db.collection('service').insertOne({
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
    }) */

  }
  catch(err){
    console.log(err);
  }
}

