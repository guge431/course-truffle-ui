// hooks/useContracts.js - 合约管理自定义Hook
import { useState, useCallback } from 'react';
import { ethers } from '../utils/ethers.js';
import { CONTRACTS } from '../config/contracts.js';

export function useContracts() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // 连接钱包
  const connectWallet = useCallback(async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        
        setProvider(provider);
        setSigner(signer);
        setAccount(accounts[0]);
        
        // 初始化合约
        const myCoinContract = new ethers.Contract(CONTRACTS.MyCoin.address, CONTRACTS.MyCoin.abi, signer);
        const exchangeContract = new ethers.Contract(CONTRACTS.ExchangeETH.address, CONTRACTS.ExchangeETH.abi, signer);
        const buyCoursesContract = new ethers.Contract(CONTRACTS.BuyCourses.address, CONTRACTS.BuyCourses.abi, signer);
        
        setContracts({
          myCoin: myCoinContract,
          exchange: exchangeContract,
          buyCourses: buyCoursesContract
        });
        
        setStatus('钱包连接成功！');
        loadBalances(accounts[0], provider, myCoinContract);
      } else {
        setError('请安装 MetaMask 钱包');
      }
    } catch (err) {
      console.error('连接钱包失败:', err);
      setError('连接钱包失败: ' + err.message);
    }
  }, []);

  // 加载余额
  const loadBalances = useCallback(async (address, provider, tokenContract) => {
    try {
      const ethBal = await provider.getBalance(address);
      const tokenBal = await tokenContract.balanceOf(address);
      
      setEthBalance(ethers.formatEther(ethBal));
      setTokenBalance(tokenBal.toString());
    } catch (err) {
      console.error('加载余额失败:', err);
      setError('加载余额失败: ' + err.message);
    }
  }, []);

  // 兑换代币
  const exchangeTokens = useCallback(async (ethAmount) => {
    if (!ethAmount || !contracts.exchange) return;
    
    setLoading(true);
    setError('');
    try {
      const tx = await contracts.exchange.buyTokens({
        value: ethers.parseEther(ethAmount)
      });
      
      setStatus('交易已提交，等待确认...');
      await tx.wait();
      setStatus('兑换成功！');
      
      // 刷新余额
      loadBalances(account, provider, contracts.myCoin);
    } catch (err) {
      console.error('兑换失败:', err);
      setError('兑换失败: ' + err.message);
    }
    setLoading(false);
  }, [contracts, account, provider, loadBalances]);

  // 购买课程
  const purchaseCourse = useCallback(async (courseId, price) => {
    if (!contracts.myCoin || !contracts.buyCourses) return;
    
    setLoading(true);
    setError('');
    try {
      // 首先授权
      const approveTx = await contracts.myCoin.approve(CONTRACTS.BuyCourses.address, price);
      setStatus('授权交易已提交，等待确认...');
      await approveTx.wait();
      
      // 然后购买课程
      const purchaseTx = await contracts.buyCourses.purchaseCourse(courseId);
      setStatus('购买交易已提交，等待确认...');
      await purchaseTx.wait();
      
      setStatus('课程购买成功！');
      
      // 刷新数据
      loadBalances(account, provider, contracts.myCoin);
      
      return true;
    } catch (err) {
      console.error('购买失败:', err);
      setError('购买失败: ' + err.message);
      return false;
    } finally {
      setLoading(false);
    }
  }, [contracts, account, provider, loadBalances]);

  return {
    account,
    provider,
    signer,
    contracts,
    ethBalance,
    tokenBalance,
    loading,
    status,
    error,
    connectWallet,
    loadBalances,
    exchangeTokens,
    purchaseCourse,
    setStatus,
    setError
  };
}