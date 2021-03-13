var _ = require('underscore');
var jwt = require('jsonwebtoken');
const {getPublicKey} = require('../helpers/signature');

function jwtVerify(token){
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET, {ignoreExpiration: false}, (err, d)=>{
      if(err){
        return reject(err);
      }
      resolve(d);
    })
  });
}


module.exports.challange = async function(req, res){
  var token = jwt.sign({
    challange: Date.now()
  }, process.env.JWT_SECRET, { expiresIn: 60 });
  
  return res.json({challange: token});
}

module.exports.signin = async function(req, res){

  const  {email, publicKey, toSign, signature} = req.body;

  if(!email || !publicKey || !toSign || !signature){
    return res.status(401).json('Invalid signature');
  }

  const pubK1 = getPublicKey(toSign, signature);
  if(pubK1 !== publicKey){
    return res.status(401).json('Invalid signature');
  }

  try{
    let r = await jwtVerify(toSign.slice("Signin:".length));
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }
  }
  catch(err){
    return res.status(401).json(err.message);
  }

  var token = jwt.sign({
    foo: 'bar' 
  }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
  

  console.log('signin', req.body)
  return res.json({token});
}

module.exports.signup = async function(req, res){
  const  {email, publicKey, toSign, signature} = req.body;

  if(!email || !publicKey || !toSign || !signature){
    return res.status(401).json('Invalid signature');
  }

  const pubK1 = getPublicKey(toSign, signature);
  if(pubK1 !== publicKey){
    return res.status(401).json('Invalid signature');
  }

  try{
    let r = await jwtVerify(toSign.slice("Signin:".length));
    if((Date.now() - (new Date(r.challange).getTime())) > 60*1000){
      return res.status(401).json('Old Challange');
    }
  }
  catch(err){
    return res.status(401).json(err.message);
  }

  var token = jwt.sign({
    foo: 'bar' 
  }, process.env.JWT_SECRET, { expiresIn: 60 * 60 });
  

  console.log('signin', req.body)
  return res.json({token});
}

module.exports.jwtMiddleware = async function(req, res, next){
  
  let token = req.get('Authorization');
  if(!token){
    return res.status(401).json('Requires JWT');
  }

  try{
    await jwtVerify(token.slice('Bearer '.length));
    next();
  }
  catch(err){
    return res.status(401).json(err.message);
  }

}
