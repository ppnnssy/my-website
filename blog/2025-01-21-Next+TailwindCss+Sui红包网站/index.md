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

```jsx
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

```jsx

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

```jsx
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

### Provider  
在使用库与链上交互，或者使用库组件的时候，需要先在顶层组件包裹一个 Provider。  
这里有个坑，由于使用的是Next，分前后端渲染，而Provider 只在客户端渲染，所以需要在顶层组件包裹一个`"use client"`。  
与之矛盾的是，想要添加元数据，需要在服务端渲染，不能使用`"use client"`。  

解决方法是把Provider单独提取出来，做成一个组件，然后包裹顶层layout。
Provider.js:  
```jsx
"use client";
import React from "react";
import "@mysten/dapp-kit/dist/index.css";
import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { networkConfig } from "./networkConfig.js";

const queryClient = new QueryClient();

export default function Provider({ children }) {
  return (
        <React.StrictMode>
          <QueryClientProvider client={queryClient}>
            <SuiClientProvider
              networks={networkConfig}
              defaultNetwork="testnet"
            >
              <WalletProvider autoConnect>
                {children}
              </WalletProvider>
            </SuiClientProvider>
          </QueryClientProvider>
        </React.StrictMode>
  );
}
```

### 连接账户
本身链接账户有官方提供的组件 ConnectButton 还是非常方便的，但是在Next项目中，改变组件的样式比较麻烦，而且想尝试不同的实现方法，于是换成下面的方法：  
```js
"use client";
import Link from "next/link";
import {
  ConnectModal,
  useCurrentAccount,
  useDisconnectWallet,
  useAccounts,
  useSwitchAccount,

} from "@mysten/dapp-kit";
import { useState } from "react";
import { truncateString } from "@/utils/util.js";
import {  Popover } from "antd";

const Navbar = () => {
  // 当前账户
  const currentAccount = useCurrentAccount();

  const { mutate: disconnect } = useDisconnectWallet();
  const { mutate: switchAccount } = useSwitchAccount();
  // 所有授权账户列表
  const accounts = useAccounts();
// 控制插件弹出状态
  const [open, setOpen] = useState(false);

  const content = (
    <div className="w-24 ">
      {accounts.map((account) => (
        <p
          className="border-b-[1px] border-b-slate-100 text-center cursor-pointer"
          key={account.address}
          onClick={() => {
            switchAccount(
              { account },
              {
                onSuccess: () => console.log(`switched to ${account.address}`),
              }
            );
          }}
        >
          {truncateString(account.address)}
        </p>
      ))}

      <p
        className="text-center text-base font cursor-pointer"
        onClick={() => {
          // 先把弹窗状态调一下，要不然会自动弹窗
          setOpen(false);
          setTimeout(() => {
            disconnect();
          });
        }}
      >
        disconnect
      </p>
    </div>
  );
  return (
    <div>
      <div className="w-full  px-4 bg-slate-200 shadow-sm fixed  left-1/2 transform -translate-x-1/2 z-10 border border-b-slate-300">
        <div className="max-w-7xl h-14 mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2">
              <div className="bg-black rounded-lg p-2">
                <svg
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
              <span className="font-semibold text-lg">RP</span>
            </div>
          </Link>

          {/* Wallet Address */}
          {currentAccount ? (
            <Popover className="cursor-pointer" content={content} title="" trigger="click">
              {truncateString(currentAccount.address)}
            </Popover>
          ) : (
            <ConnectModal
              trigger={<button disabled={!!currentAccount}>Connect</button>}
              open={open}
              onOpenChange={(isOpen) => setOpen(isOpen)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
```
上述代码中，放弃使用ConnectButton组件，转而使用ConnectModal更精细的控制连接，完全自定义连接按钮和账户的样式。

layout.js:  
```jsx
import "./globals.css";
import React from "react";
import "@mysten/dapp-kit/dist/index.css";
import "@ant-design/v5-patch-for-react-19";
import Provider from "@/components/Provider";
export const metadata = {
  title: "发个红包",
  description: "A Next.js client-side page example with metadata.",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black">
        <Provider> {children}</Provider>
      </body>
    </html>
  );
}
```



### 调用合约函数
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

实际使用：  
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

