import React from 'react';
import img from './db38e61a01c5513d6ff930cd2dbf54d.jpg'
export default function Highlight({children, color}) {
  return (
   <img src={img} alt="未加载"  style={{width:'50%'}} />
  );
}