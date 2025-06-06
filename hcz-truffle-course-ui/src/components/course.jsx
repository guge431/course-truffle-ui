import React, { useState, useEffect } from 'react';

// 模拟各个模块的导入
const ethers = {
  formatEther: (wei) => {
    const weiNum = typeof wei === 'string' ? parseInt(wei, 16) : wei;
    return (weiNum / Math.pow(10, 18)).toString();
  },
  parseEther: (ether) => {
    const weiValue = Math.floor(parseFloat(ether) * Math.pow(10, 18));
    return '0x' + weiValue.toString(16);
  },
  BrowserProvider: class {
    constructor(ethereum) { this.ethereum = ethereum; }
    async send(method, params) { return await this.ethereum.request({ method, params }); }
    async getSigner() {
      const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
      return new ethers.JsonRpcSigner(this.ethereum, accounts[0]);
    }
    async getBalance(address) {
      return await this.ethereum.request({ method: 'eth_getBalance', params: [address, 'latest'] });
    }
  },
  JsonRpcSigner: class {
    constructor(ethereum, address) { this.ethereum = ethereum; this.address = address; }
    async getAddress() { return this.address; }
  },
  Contract: class {
    constructor(address, abi, signer) {
      this.address = address; this.abi = abi; this.signer = signer;
      abi.forEach(item => {
        if (item.type === 'function') this[item.name] = (...args) => this._callFunction(item, args);
      });
    }
    async _callFunction(functionAbi, args) {
      return { hash: 'mock', wait: () => new Promise(resolve => setTimeout(() => resolve({ status: 1 }), 3000)) };
    }
  }
};

const CONTRACTS = {
  MyCoin: { address: '0x1dd4529E768311029220E78cB2aCe76884705Be0', abi: [] },
  ExchangeETH: { address: '0x952e18d91e7093eaF980FF679265Ea5CAE9bebe3', abi: [] },
  BuyCourses: { address: '0x33E24BC62e32e9db2a001b117E96348D1f540847', abi: [] }
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    position: 'relative',
    overflow: 'hidden',
    padding: '20px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  breathingLight: {
    position: 'absolute',
    top: '-50%', left: '-50%', width: '200%', height: '200%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
    animation: 'breathe 4s ease-in-out infinite',
    pointerEvents: 'none'
  },
  floatingOrbs: {
    position: 'absolute', width: '100px', height: '100px', borderRadius: '50%',
    background: 'linear-gradient(45deg, rgba(255,255,255,0.1), rgba(255,255,255,0.3))',
    animation: 'float 6s ease-in-out infinite', pointerEvents: 'none'
  },
  header: { textAlign: 'center', color: 'white', marginBottom: '40px', position: 'relative', zIndex: 10 },
  title: {
    fontSize: '3rem', fontWeight: '700', textShadow: '0 0 20px rgba(255,255,255,0.5)',
    marginBottom: '10px', background: 'linear-gradient(45deg, #fff, #f0f0f0)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
  },
  subtitle: { fontSize: '1.2rem', opacity: '0.9' },
  mainContent: { maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 10 },
  tabContainer: { display: 'flex', justifyContent: 'center', marginBottom: '30px', gap: '10px' },
  tab: {
    padding: '12px 30px', borderRadius: '25px', background: 'rgba(255,255,255,0.1)',
    color: 'white', cursor: 'pointer', transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)'
  },
  activeTab: {
    background: 'rgba(255,255,255,0.3)', transform: 'translateY(-2px)',
    boxShadow: '0 5px 15px rgba(0,0,0,0.2)'
  },
  card: {
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)',
    borderRadius: '20px', padding: '30px', border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)', marginBottom: '20px'
  },
  input: {
    width: '100%', padding: '15px', border: 'none', borderRadius: '10px',
    background: 'rgba(255,255,255,0.9)', marginBottom: '15px', fontSize: '16px',
    outline: 'none', boxSizing: 'border-box'
  },
  button: {
    padding: '15px 30px', border: 'none', borderRadius: '10px',
    background: 'linear-gradient(45deg, #ff6b6b, #ffd93d)', color: 'white',
    fontSize: '16px', fontWeight: '600', cursor: 'pointer',
    transition: 'all 0.3s ease', textTransform: 'uppercase', letterSpacing: '1px'
  },
  connectButton: { background: 'linear-gradient(45deg, #4CAF50, #45a049)', marginBottom: '20px' },
  courseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' },
  courseCard: {
    background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(15px)',
    borderRadius: '15px', padding: '20px', border: '1px solid rgba(255,255,255,0.2)',
    transition: 'all 0.3s ease'
  },
  statusText: { color: '#4CAF50', fontWeight: '600', textAlign: 'center', margin: '10px 0' },
  errorText: { color: '#ff6b6b', fontWeight: '600', textAlign: 'center', margin: '10px 0' },
  walletInfo: {
    background: 'rgba(255,255,255,0.1)', padding: '15px', borderRadius: '10px',
    marginBottom: '20px', color: 'white'
  }
};

// 组件定义
function BackgroundEffects() {
  return (
    <>
      <div style={styles.breathingLight}></div>
      <div style={{...styles.floatingOrbs, top: '10%', left: '10%', animationDelay: '0s'}}></div>
      <div style={{...styles.floatingOrbs, top: '20%', right: '10%', animationDelay: '2s'}}></div>
      <div style={{...styles.floatingOrbs, bottom: '10%', left: '20%', animationDelay: '4s'}}></div>
    </>
  );
}

function WalletConnect({ onConnect }) {
  return (
    <div style={styles.card}>
      <button 
        style={{...styles.button, ...styles.connectButton, width: '100%'}}
        onClick={onConnect}
        className="button-hover"
      >
        🦊 连接 MetaMask 钱包
      </button>
    </div>
  );
}

function WalletInfo({ account, ethBalance, tokenBalance }) {
  return (
    <div style={styles.walletInfo}>
      <div><strong>钱包地址:</strong> {account.slice(0, 6)}...{account.slice(-4)}</div>
      <div><strong>ETH 余额:</strong> {parseFloat(ethBalance).toFixed(4)} ETH</div>
      <div><strong>HCZ 代币余额:</strong> {tokenBalance} HCZ</div>
    </div>
  );
}

function TabNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { key: 'exchange', label: '💱 代币兑换' },
    { key: 'courses', label: '📚 课程商城' }
  ];

  return (
    <div style={styles.tabContainer}>
      {tabs.map(tab => (
        <button
          key={tab.key}
          style={{
            ...styles.tab,
            ...(activeTab === tab.key ? styles.activeTab : {})
          }}
          onClick={() => onTabChange(tab.key)}
          className="button-hover"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function StatusMessage({ status, error }) {
  if (!status && !error) return null;
  return (
    <>
      {status && <div style={styles.statusText}>{status}</div>}
      {error && <div style={styles.errorText}>{error}</div>}
    </>
  );
}

function TokenExchange({ ethAmount, setEthAmount, onExchange, loading }) {
  return (
    <div style={styles.card}>
      <h3 style={{color: 'white', textAlign: 'center', marginBottom: '20px'}}>
        💰 ETH 兑换 HCZ 代币
      </h3>
      <p style={{color: 'rgba(255,255,255,0.8)', textAlign: 'center', marginBottom: '20px'}}>
        兑换比例: 1 ETH = 100 HCZ
      </p>
      <input
        type="number"
        placeholder="输入 ETH 数量"
        value={ethAmount}
        onChange={(e) => setEthAmount(e.target.value)}
        style={styles.input}
      />
      <button
        onClick={onExchange}
        disabled={loading || !ethAmount}
        style={{
          ...styles.button,
          width: '100%',
          opacity: loading || !ethAmount ? 0.6 : 1
        }}
        className="button-hover"
      >
        {loading ? '兑换中...' : '🔄 开始兑换'}
      </button>
    </div>
  );
}

function CourseGrid({ courses, onPurchase, loading }) {
  if (courses.length === 0) {
    return (
      <div>
        <h3 style={{color: 'white', textAlign: 'center', marginBottom: '30px'}}>
          📚 课程商城
        </h3>
        <div style={{...styles.card, textAlign: 'center', color: 'white'}}>
          暂无课程，敬请期待...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 style={{color: 'white', textAlign: 'center', marginBottom: '30px'}}>
        📚 课程商城
      </h3>
      <div style={styles.courseGrid}>
        {courses.map(course => (
          <div key={course.id} style={styles.courseCard} className="course-card">
            <h4 style={{color: 'white', marginBottom: '10px'}}>
              {course.name}
            </h4>
            <p style={{color: 'rgba(255,255,255,0.8)', marginBottom: '15px'}}>
              {course.description}
            </p>
            <div style={{color: 'rgba(255,255,255,0.7)', marginBottom: '10px'}}>
              <strong>价格:</strong> {course.price} HCZ
            </div>
            <div style={{color: 'rgba(255,255,255,0.7)', marginBottom: '15px'}}>
              <strong>讲师:</strong> {course.teacher.slice(0, 6)}...{course.teacher.slice(-4)}
            </div>
            {course.purchased ? (
              <button 
                style={{
                  ...styles.button,
                  background: 'linear-gradient(45deg, #4CAF50, #45a049)',
                  width: '100%'
                }}
                disabled
              >
                ✅ 已购买
              </button>
            ) : (
              <button
                onClick={() => onPurchase(course.id, course.price)}
                disabled={loading}
                style={{
                  ...styles.button,
                  width: '100%',
                  opacity: loading ? 0.6 : 1
                }}
                className="button-hover"
              >
                {loading ? '购买中...' : '🛒 立即购买'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// 主应用组件
export default function CryptoCoursePlatform() {
  const [activeTab, setActiveTab] = useState('exchange');
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contracts, setContracts] = useState({});
  const [ethAmount, setEthAmount] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  // 连接钱包
  const connectWallet = async () => {
    try {
      setStatus('钱包连接成功！');
      setAccount('0x742d35Cc6635C0532925a3b8D24fEff4d123456789');
      setEthBalance('1.5');
      setTokenBalance('150');
      loadCourses();
    } catch (err) {
      setError('连接钱包失败: ' + err.message);
    }
  };

  // 兑换代币
  const exchangeTokens = async () => {
    if (!ethAmount) return;
    setLoading(true);
    setError('');
    try {
      setStatus('交易已提交，等待确认...');
      await new Promise(resolve => setTimeout(resolve, 2000));
      setStatus('兑换成功！');
      setEthAmount('');
    } catch (err) {
      setError('兑换失败: ' + err.message);
    }
    setLoading(false);
  };

  // 加载课程
  const loadCourses = () => {
    const mockCourses = [
      {
        id: 0,
        name: 'Solidity 智能合约开发',
        description: '从零开始学习智能合约开发，掌握 Solidity 语言基础知识和最佳实践',
        price: '50',
        teacher: '0x742d35Cc6635C0532925a3b8D24fEff4d',
        purchased: false
      },
      {
        id: 1,
        name: 'DeFi 协议设计',
        description: '深入了解去中心化金融协议的设计原理和实现方法，学习流动性挖矿',
        price: '100',
        teacher: '0x742d35Cc6635C0532925a3b8D24fEff4d',
        purchased: false
      },
      {
        id: 2,
        name: 'NFT 开发实战',
        description: '学习如何创建、部署和交易 NFT，掌握数字资产开发的完整流程',
        price: '75',
        teacher: '0x742d35Cc6635C0532925a3b8D24fEff4d',
        purchased: false
      }
    ];
    setCourses(mockCourses);
  };

  // 购买课程
  const purchaseCourse = async (courseId, price) => {
    setLoading(true);
    setError('');
    try {
      setStatus('授权交易已提交，等待确认...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('购买交易已提交，等待确认...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStatus('课程购买成功！');
      
      setCourses(prev => prev.map(course => 
        course.id === courseId ? {...course, purchased: true} : course
      ));
    } catch (err) {
      setError('购买失败: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <style>{`
        @keyframes breathe {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(120deg); }
          66% { transform: translateY(-10px) rotate(240deg); }
        }
        .button-hover:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }
        .course-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        }
      `}</style>

      <BackgroundEffects />

      <header style={styles.header}>
        <h1 style={styles.title}>🚀 Crypto Course Platform</h1>
        <p style={styles.subtitle}>用 ETH 兑换 HCZ 代币，购买优质课程</p>
      </header>

      <div style={styles.mainContent}>
        {!account ? (
          <WalletConnect onConnect={connectWallet} />
        ) : (
          <>
            <WalletInfo 
              account={account}
              ethBalance={ethBalance}
              tokenBalance={tokenBalance}
            />

            <TabNavigation 
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />

            <StatusMessage status={status} error={error} />

            {activeTab === 'exchange' && (
              <TokenExchange
                ethAmount={ethAmount}
                setEthAmount={setEthAmount}
                onExchange={exchangeTokens}
                loading={loading}
              />
            )}

            {activeTab === 'courses' && (
              <CourseGrid
                courses={courses}
                onPurchase={purchaseCourse}
                loading={loading}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}