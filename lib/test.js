// buffer.transcode(source, fromEnc, toEnc)

const buffer = require('buffer');

var re = Buffer.isEncoding('gbk');
console.log(re);
const newBuf = buffer.transcode(Buffer.from('€'), 'utf8', '');
console.log(newBuf.toString('ascii'));

const { StringDecoder } = require('string_decoder');
const decoder = new StringDecoder('utf8');

const cent = Buffer.from([0xC2, 0xA2]);
console.log(decoder.write(cent));

const euro = Buffer.from([0xE2, 0x82, 0xAC]);
console.log(decoder.write(euro));