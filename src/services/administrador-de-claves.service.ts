import {injectable, /* inject, */ BindingScope} from '@loopback/core';

var generatePassword = require('password-generator'); //para esto instalamos, generar una clave instalamos npm i password-generator
var CryptoJS = require("crypto-js");
@injectable({scope: BindingScope.TRANSIENT})
export class AdministradorDeClavesService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */

  GenerarClaveAleatoria(){
    let claveAleatoria = generatePassword(8, false);
    return claveAleatoria;
  }
  //Encriptar clave se instala npm install crypto-js

  cifrarTexto(texto: string){
    let textoCifrado = CryptoJS.MD5(texto).toString();
    return textoCifrado;
  }





}
