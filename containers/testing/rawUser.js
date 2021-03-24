'use strict';

const _ = require('underscore');

const posibleElements = [
  'Hepatitis',
  'Tatuaje',
  'HIV',
  'Gripa',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  null
];

let randomArray = () => {
  return _.filter(_.sample(posibleElements, 3), (n)=>{
    return n !== null;
  });
};

let randomUser = (id) =>{

  let d1 = new Date('2018-01-01T01:00:00');
  let d2 = new Date('2019-12-01T00:00:00');


  let date = new Date(_.random(d1.getTime(), d2.getTime()));

  return {
    id: id+'',
    date: date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate(),
    impediments: randomArray()
  };
};

module.exports = randomUser;