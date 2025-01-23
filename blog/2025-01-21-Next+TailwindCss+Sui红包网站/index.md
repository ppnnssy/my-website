---
slug: Next+TailwindCss+Sui红包网站
title: Next+TailwindCss+Sui红包网站
authors: [ppnnssy]
tags: [tailwindcss, Next, Sui]
---

之前抄过一个像素风的红包网站，不过那次重点是像素风，也比较简陋。这次的目标是生产级的，能够真正使用的网站。  
主要的技术是 Next.js + TailwindCss + Sui。  
页面设计大部分是抄的，现在还没全抄完，先把做完的写写笔记吧。  
红包网站页面不过，主要还是记录一下开发过程中遇到的问题。

<!-- truncate -->

## Next 搭建项目

官网： https://nextjs.org/  
直接新建项目：  
`npx create-next-app@latest`

Next 项目中，路由的配置变化比较大，不再是使用 Router.js 这样的单独文件的方式，而是以文件夹结构为路由结构。这个之前学习的时候学到过。  
每个路由页面都有两个文件，page.js 和 layout.js，前者是页面内容，后者是布局。  
这个规则比较多，但是不难，参考：  
官网文档：https://nextjs.org/docs/app/getting-started/layouts-and-pages  
掘金教程：https://juejin.cn/post/7296330137284788275

Next 是分服务端渲染和客户端渲染的，当跟链上交互的时候，尤其需要注意。下面的 Provider 会提到。

## TailwindCss

前几天刚写了一篇 TailwindCss 的文章，实际在项目中使用的时候还是觉得不如 Vue 直接写 CSS。  
不用取类名当然很爽，但是要记 tailwind 的这么多类名也是很痛苦的。而且打包的 css 文件大小大多数时候我们并不关心，除非很大的项目对性能要求很高。  
其次，没有语义的类名对维护不友好。  
不过现在海外 tailwind 大势所趋，很多轮子都是用这个，所以还是得学。

总结一下使用过程中遇到的问题：

1. 背景图设置  
   设置背景图，图片 URL 是个变量，使用拼接字符串不起作用。最后只能写内敛样式表。

```
  <div
      style={{
        backgroundImage: `url(${coinInfo[item.type]?.iconUrl})`,
      }}
      className={`bg-no-repeat  bg-center bg-cover h-14 w-14 mr-3`}
    ></div>
```

2. 深度选择器  
   想要更改第三方库的样式，使用 Tailwind 无法实现，最终还是需要使用 css。  
   方法就是传统的给父元素加类名，然后在 css 文件中直接选择类，然后引入 css 文件

```
  return <div className='fa'>
    <Collapse items={items} defaultActiveKey={['1']} onChange={onChange} />
  </div>;

  // 引入css
  // page.css:
.fa .ant-collapse .ant-collapse-item .ant-collapse-header .ant-collapse-header-text{
    color:red
}
.fa{
    background-color: white;
}
```

3. 动态类名  
   就是使用拼接字符串，感觉蠢蠢的

```
"use client";
import React, { useState } from "react";

const Send = () => {
  const [color, setColor] = useState("white");
  return (
    <div
      className={`w-28  h-28 bg-${color} `}
      onClick={() => {
        setColor(color == "white" ? "red-600" : "white");
      }}
    >
    </div>
  );
};
export default Send;
```

## Sui 链上交互

链上交互主要依靠`@mysten`库中的"@mysten/dapp-kit"，"@mysten/sui/transactions"  
Sui 官方文档： https://docs.sui.io/guides  
@mysten 库官方文档： https://sdk.mystenlabs.com/typescript/migrations/sui-1.0

项目中用到的主要功能和函数：  
useTransactionExecution.js 封装了发送交易请求的 hook

```js
// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0
import { useSignTransaction, useSuiClient } from "@mysten/dapp-kit";
import { SuiTransactionBlockResponse } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";

/**
 * A hook to execute transactions.
 * It signs the transaction using the wallet and executes it through the RPC.
 *
 * That allows read-after-write consistency and is generally considered a best practice.
 */
export function useTransactionExecution() {
  const client = useSuiClient();
  const { mutateAsync: signTransactionBlock } = useSignTransaction();

  // 返回一个闭包，需要传入一个交易块作为参数
  const executeTransaction = async (txb) => {
    try {
      // 签名
      const signature = await signTransactionBlock({
        transaction: txb,
      });
      // 执行交易
      const res = await client.executeTransactionBlock({
        transactionBlock: signature.bytes,
        signature: signature.signature,
        options: {
          showEffects: true,
          showObjectChanges: true,
        },
      });

      console.log("success");

      return res;
    } catch (e) {
      console.log(e);
    }
  };

  return executeTransaction;
}
```

suiData.js 封装常用的交易函数：

```js
// 获取一种类型的所有硬币列表
export const getCoins = async (client, currentAccount, coinType) => {
  const { data } = await client.getCoins({
    owner: currentAccount?.address,
    coinType: coinType,
  });

  return data;
};

export const combineCoins = async (txb, coins, coinType) => {
  if (coins.length < 2) return;
  let idList = coins.map((i) => {
    console.log(i.coinObjectId);

    return i.coinObjectId;
  });

  for (let i = 1; i < idList.length - 2; i++) {
    txb.moveCall({
      target: "0x2::coin::join",
      arguments: [txb.object(idList[0]), txb.object(idList[i])],
      typeArguments: [coinType],
    });
  }
};

export const splitCoins = async (txb, coin, coinType, amount, decimals) => {
  console.log(coin, coinType, amount, decimals);

  const given_coin = txb.moveCall({
    target: "0x2::coin::split",
    arguments: [
      txb.object(coin.coinObjectId),
      txb.pure(amount * 10 ** decimals),
    ],
    typeArguments: [coinType],
  });

  return given_coin;
};
```

```js
import { Transaction } from "@mysten/sui/transactions";
import {
  useSuiClient,
  useCurrentAccount,
} from "@mysten/dapp-kit";
import { useTransactionExecution } from "@/api/useTransactionExecution.js";//引入上面的文件
import {
  getCoins,
  combineCoins,
  splitCoins,
} from "@/api/suiData.js";//引入上面的文件


export default function App() {
    const client = useSuiClient();
    const currentAccount = useCurrentAccount();
    const executeTx = useTransactionExecution(); //用于交易的闭包函数
    ...
    const send = ()=>{
        let txb = new Transaction();//构建交易块
        ...
        let coins = await getCoins(client, currentAccount, fullType);//获取铸币数据

      let given_balance;
      // SUI特殊处理，不需要合并代币，直接分割SUI并付交易费
      if (fullType == "0x2::sui::SUI") {
        given_balance = txb.splitCoins(txb.gas, [0.05 * 10 ** 9]);
      } else {
        // 其他种类的铸币需要合并对象，然后分隔出一个balance数量的铸币
        await combineCoins(txb, coins, fullType);
        // 分割代币
        given_balance = await splitCoins(
          txb,
          coins[0],
          fullType,
          amount,
          coinInfo[type].decimals
        );
      }

    // 发送红包数据
      txb.moveCall({
        target: `${TESTNET_ZKREDPACK_PACKAGE_ID}::happyrp::create_rp`,
        arguments: [
          txb.object(
            "0x80011863aba3e88fb5f975ef124bd3bf3340398625a9372b52d583d012bcac17"
          ),
          txb.object(given_balance),
          txb.pure.u64(amount),
          txb.object(encryptedPassword),
        ],
        typeArguments: [fullType],
      });

    // 执行交易
    let res = executeTx(txb);
      console.log(res);
    }
}
```

总之大概就是这样，使用txb构造交易块，把需要的操作全部写到交易块中，然后执行。  
交易块主要的参数就是指定目标合约，目标函数，传递参数，传递泛型参数。比如：  
```js
  const given_coin = txb.moveCall({
    target: "0x2::coin::split",//目标合约id:0x2,合约名：coin，函数名：split
    // 函数参数
    arguments: [
      txb.object(coin.coinObjectId),
      txb.pure(amount * 10 ** decimals),
    ],
    // 泛型参数
    typeArguments: ['0x2::sui::SUI'],
  });
```

