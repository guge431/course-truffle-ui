// components/WalletInfo.jsx - 钱包信息组件
import React from 'react';
import { styles } from '../styles/index.js';

export default function WalletInfo({ account, ethBalance, tokenBalance,network,tokenSymbol,contactTokenBalance }) {
  return (
    <div style={styles.walletInfo}>
      <div><strong>钱包地址:</strong> {account.slice(0, 6)}...{account.slice(-4)}</div>
      <div><strong>网络：</strong>{network}</div>
      <div><strong>ETH 余额:</strong> {parseFloat(ethBalance).toFixed(4)} ETH</div>
      <div><strong>个人账户{tokenSymbol}代币余额:</strong> {tokenBalance} HCZ</div>
      <div><strong>开户合约代币余额:</strong> {contactTokenBalance} HCZ</div>
    </div>
  );
}