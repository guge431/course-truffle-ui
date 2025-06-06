import React, { useState} from 'react';
import { styles } from './styles/index.js';
import BackgroundEffects from './components/BackgroundEffects.jsx';
import WalletConnect from './components/WalletConnect.jsx';
import WalletInfo from './components/WalletInfo.jsx';
import TabNavigation from './components/TabNavigation.jsx';
import StatusMessage from './components/StatusMessage.jsx';
import TokenExchange from './components/TokenExchange.jsx';
import CourseGrid from './components/CourseGrid.jsx';
import { ethers} from "ethers";
import {CONTRACTS} from './config/contracts.js';

// 主应用组件
export default function CryptoCoursePlatform() {
  const [activeTab, setActiveTab] = useState('exchange');
  const [ethAmount, setEthAmount] = useState('');

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // 获取当前钱包信息
  const [account, setAccount] = useState('');
  const [network, setNetwork] = useState('');
  const [error, setError] = useState('');
  const [tokenBalance, setTokenBalance] = useState('0');
  const [ethBalance, setEthBalance] = useState('0');
  const [tokenSymbol, setTokenSymbol] = useState('');
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contactTokenBalance, setContactTokenBalance] = useState('0');
  //弹窗
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseData, setCourseData] = useState({
    id: '',
    name: '',
    description: '',
    price: '',
    teacher: ''
  });

  // 连接钱包
  const connectWallet = async () => {
    if(!window.ethereum){
      setError('请安装 MetaMask 或其他支持 Ethereum 的钱包');
    }else{
      //然后获取用户账户
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        // 请求用户授权
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        setSigner(signer)
        // 获取账户地址
        const address = await signer.getAddress();
        console.log('当前账户：', address,accounts);
        setAccount(accounts[0]); 
        // 获取 ETH 余额
        const balance = await provider.getBalance(address);
        setEthBalance(ethers.formatEther(balance));
        // 获取网络信息
        const network = await provider.getNetwork();
        setNetwork(`${network.name} (chainId: ${network.chainId})`);
        console.log('当前网络：', network);
        // 获取 HCZ 代币余额
        const tokenContract = new ethers.Contract(CONTRACTS.MyCoin.address, CONTRACTS.MyCoin.abi, signer);
        const rawTokenBalance = await tokenContract.balanceOf(address);

        const contactTokenBalance = await tokenContract.balanceOf(CONTRACTS.MyCoin.address);
        setContactTokenBalance(contactTokenBalance)

        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        setTokenSymbol(symbol);
        setTokenBalance(ethers.formatUnits(rawTokenBalance, decimals));

      
        //加载课程
        loadCourses(signer,address);
      } catch (err) {
        console.error(err);
        setError('连接钱包失败：' + err.message);
      }
    }
  };
  //打开新增课程弹窗
 const openddcourses=()=>{
  setIsModalOpen(true);
 };
//点击新增课程
 const handleSubmitAddCourses=async()=>{
  const coursesContract = new ethers.Contract(CONTRACTS.BuyCourses.address, CONTRACTS.BuyCourses.abi, signer);
  const {name,description,price,teacher}=courseData
  try{ 
    await coursesContract.addCourse(name,description,price,teacher)
    handleCancel()
  }catch(err){
    console.log(err,'添加课程失败')
  }
}
  // 加载课程
  const loadCourses = async(signer,address) => {
    try {
    const coursesContract = new ethers.Contract(CONTRACTS.BuyCourses.address, CONTRACTS.BuyCourses.abi, signer);
    //课程总数
    const courseCount = await coursesContract.courseCountId();
    //课程
    const courses = [];
    for (let i = 0; i < courseCount; i++) {
      const course = await coursesContract.getCourse(i);
      const isPurchase = await coursesContract.hasPurchased(address,i)
      courses.push({
        id: i,
        name: course[0],
        description: course[1],
        price:course[2],
        teacher: course[3],
        isPurchase:isPurchase
      });
    }
    setCourses(courses)
    console.log('hecgebg', courses)
    } catch (error) {
      console.error("获取所有课程失败:", error);
    }
  };

  // 兑换代币
  const exchangeTokens = async () => {
    if (!ethBalance) {
      alert('ETH 数量不能为0');
      return;
    }
    if (isNaN(ethAmount) || parseFloat(ethAmount) <= 0) {
      alert('请输入有效的 ETH 金额');
      return;
    }
    setLoading(true);
    setError('');
    const ExchangeContract = new ethers.Contract(CONTRACTS.ExchangeETH.address, CONTRACTS.ExchangeETH.abi, signer);
    try {
      setStatus('交易已提交，等待确认...');
      const tx = await ExchangeContract.buyTokens({ value:ethers.parseEther(ethAmount) });
      setStatus('交易已发送，等待区块确认...');
      await tx.wait();
      setStatus('兑换成功！');
      setEthAmount('');
    } catch (err) {
      setError('兑换失败: ' + err.message);
    }
    setLoading(false);
  };
  // 购买课程
  const purchaseCourse = async (courseId, price) => {
    setLoading(true);
    setError('');
    const coursesContract = new ethers.Contract(CONTRACTS.BuyCourses.address, CONTRACTS.BuyCourses.abi, signer);
    const tokenAddress = await coursesContract.token();
    const tokenContract = new ethers.Contract(
      tokenAddress,
      CONTRACTS.MyCoin.abi, // 代币合约的 ABI
      signer
    );
    await tokenContract.approve(CONTRACTS.BuyCourses.address, price);
    try {
        setStatus('授权交易已提交，等待确认...');
        const tx=await coursesContract.purchaseCourse(courseId)
        setStatus('购买交易已提交，等待确认...');
        await tx.wait();
        setStatus('课程购买成功！');
        loadCourses(signer,account)

    } catch (err) {
      setError('购买失败: ' + err.message);
    }
    setLoading(false);
  };
  //弹窗取消
  const handleCancel = () => {
    setIsModalOpen(false);
    // 重置表单
    setCourseData({
      id: '',
      name: '',
      description: '',
      price: '',
      teacher: ''
    });
  };
  //课程输入
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCourseData(prev => ({
      ...prev,
      [name]: value,
    }));
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
              network={network}
              tokenSymbol={tokenSymbol}
              contactTokenBalance={contactTokenBalance}
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
                onAddCourse={openddcourses}
                onPurchase={purchaseCourse}
                loading={loading}
              />
            )}
          </>
        )}
      </div>

      {isModalOpen && (
        <div style={styles.modalOverlay} onClick={handleCancel}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={{ margin: 0, color: '#333' }}>📚 添加新课程</h2>
              <button 
                style={styles.closeButton} 
                onClick={handleCancel}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#f0f0f0';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                }}
              >
                ✕
              </button>
            </div>
            
            <div>
              <div style={styles.formGroup}>
                <label style={styles.label}>课程标题 *</label>
                <input
                  type="text"
                  name="name"
                  value={courseData.name}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="请输入课程标题"
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>课程描述 *</label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleInputChange}
                  style={styles.textarea}
                  placeholder="请输入课程详细描述"
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.price}>课程价格 *</label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="请输入课程价格"
                  min="0"
                  step="0.01"
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.price}>课程老师 *</label>
                <input
                  type="text"
                  name="teacher"
                  value={courseData.teacher}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="请输入课程价格"
                  min="0"
                  step="0.01"
                  onFocus={(e) => e.target.style.borderColor = '#4CAF50'}
                  onBlur={(e) => e.target.style.borderColor = '#ddd'}
                />
              </div>


              <div style={styles.buttonGroup}>
                <button 
                  type="button" 
                  style={styles.cancelButton}
                  onClick={handleCancel}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#da190b';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#f44336';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  取消
                </button>
                <button 
                  type="button" 
                  style={styles.submitButton}
                  onClick={handleSubmitAddCourses}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = '#45a049';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = '#4CAF50';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  确认添加
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}