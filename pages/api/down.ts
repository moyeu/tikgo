import type { NextApiRequest, NextApiResponse } from 'next';
import https from 'https';

const decode = (s:string) => Buffer.from(s,'base64url').toString('utf8');

export default function handler(req:NextApiRequest,res:NextApiResponse){
  const { media, bandwidth_saving } = req.query;
  if(!media || typeof media!=='string') return res.status(400).end('Thiếu media');
  const url = decode(media);

  // 1) Tiết kiệm băng thông – redirect
  if(bandwidth_saving==='1'){
    res.setHeader('Location', url.replace(/^http:/,'https:'));
    return res.status(302).end();
  }

  // 2) Proxy – truyền dòng byte
  https.get(url, up=>{
    res.writeHead(up.statusCode??200,{
      ...up.headers,
      'Access-Control-Allow-Origin':'*',
    });
    up.pipe(res);
  }).on('error',()=>res.status(502).end('Lỗi upstream'));
}
