// utils/ethers.js - 模拟 ethers 库的核心功能
export const ethers = {
    // 格式化工具
    formatEther: (wei) => {
      const weiNum = typeof wei === 'string' ? parseInt(wei, 16) : wei;
      return (weiNum / Math.pow(10, 18)).toString();
    },
    
    parseEther: (ether) => {
      const weiValue = Math.floor(parseFloat(ether) * Math.pow(10, 18));
      return '0x' + weiValue.toString(16);
    },
    
    // 浏览器提供者
    BrowserProvider: class {
      constructor(ethereum) {
        this.ethereum = ethereum;
      }
      
      async send(method, params) {
        return await this.ethereum.request({ method, params });
      }
      
      async getSigner() {
        const accounts = await this.ethereum.request({ method: 'eth_requestAccounts' });
        return new ethers.JsonRpcSigner(this.ethereum, accounts[0]);
      }
      
      async getBalance(address) {
        const balance = await this.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        });
        return balance;
      }
    },
    
    // 签名者
    JsonRpcSigner: class {
      constructor(ethereum, address) {
        this.ethereum = ethereum;
        this.address = address;
      }
      
      async getAddress() {
        return this.address;
      }
    },
    
    // 合约类
    Contract: class {
      constructor(address, abi, signer) {
        this.address = address;
        this.abi = abi;
        this.signer = signer;
        
        // 动态创建方法
        abi.forEach(item => {
          if (item.type === 'function') {
            this[item.name] = (...args) => this._callFunction(item, args);
          }
        });
      }
      
      async _callFunction(functionAbi, args) {
        const isView = functionAbi.stateMutability === 'view' || functionAbi.stateMutability === 'pure';
        const isPayable = functionAbi.stateMutability === 'payable';
        
        if (isView) {
          const data = this._encodeFunctionCall(functionAbi, args);
          const result = await this.signer.ethereum.request({
            method: 'eth_call',
            params: [{
              to: this.address,
              data: data
            }, 'latest']
          });
          
          if (functionAbi.outputs && functionAbi.outputs.length === 1) {
            const output = functionAbi.outputs[0];
            if (output.type === 'uint256') {
              return parseInt(result, 16);
            } else if (output.type === 'bool') {
              return parseInt(result, 16) === 1;
            } else if (output.type === 'string') {
              try {
                const hex = result.slice(2);
                let str = '';
                for (let i = 0; i < hex.length; i += 2) {
                  const char = String.fromCharCode(parseInt(hex.substr(i, 2), 16));
                  if (char.charCodeAt(0) !== 0) str += char;
                }
                return str;
              } catch {
                return result;
              }
            }
          }
          return result;
        } else {
          const data = this._encodeFunctionCall(functionAbi, args);
          const txParams = {
            from: this.signer.address,
            to: this.address,
            data: data
          };
          
          if (isPayable && args.length > functionAbi.inputs.length) {
            const lastArg = args[args.length - 1];
            if (lastArg && typeof lastArg === 'object' && lastArg.value) {
              txParams.value = lastArg.value;
            }
          }
          
          const txHash = await this.signer.ethereum.request({
            method: 'eth_sendTransaction',
            params: [txParams]
          });
          
          return {
            hash: txHash,
            wait: () => new Promise(resolve => {
              setTimeout(() => resolve({ status: 1 }), 3000);
            })
          };
        }
      }
      
      _encodeFunctionCall(functionAbi, args) {
        const signature = `${functionAbi.name}(${functionAbi.inputs.map(i => i.type).join(',')})`;
        const selector = this._getFunctionSelector(signature);
        
        let encodedArgs = '';
        functionAbi.inputs.forEach((input, index) => {
          if (args[index] !== undefined) {
            encodedArgs += this._encodeParameter(input.type, args[index]);
          }
        });
        
        return selector + encodedArgs;
      }
      
      _getFunctionSelector(signature) {
        const selectors = {
          'balanceOf(address)': '0x70a08231',
          'approve(address,uint256)': '0x095ea7b3',
          'allowance(address,address)': '0xdd62ed3e',
          'buyTokens()': '0xd0febe4c',
          'rate()': '0x2c4e722e',
          'purchaseCourse(uint256)': '0x8129fc1c',
          'getCourse(uint256)': '0x3548cf84',
          'hasUserPurchased(address,uint256)': '0x6c0360eb',
          'courseCountId()': '0x4bb278f3'
        };
        return selectors[signature] || '0x00000000';
      }
      
      _encodeParameter(type, value) {
        if (type === 'address') {
          return value.toLowerCase().replace('0x', '').padStart(64, '0');
        } else if (type === 'uint256') {
          return parseInt(value).toString(16).padStart(64, '0');
        } else if (type === 'bool') {
          return (value ? '1' : '0').padStart(64, '0');
        }
        return '0'.repeat(64);
      }
    }
  };