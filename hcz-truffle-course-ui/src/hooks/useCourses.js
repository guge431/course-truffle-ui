// hooks/useCourses.js - 课程管理自定义Hook
import { useState, useCallback } from 'react';

export function useCourses() {
  const [courses, setCourses] = useState([]);

  // 加载课程列表
  const loadCourses = useCallback(async (buyCoursesContract) => {
    try {
      // 由于合约调用的复杂性，这里使用模拟数据
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
    } catch (err) {
      console.error('加载课程失败:', err);
      throw new Error('加载课程失败: ' + err.message);
    }
  }, []);

  // 更新课程购买状态
  const updateCoursePurchaseStatus = useCallback((courseId) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? {...course, purchased: true} : course
    ));
  }, []);

  return {
    courses,
    loadCourses,
    updateCoursePurchaseStatus
  };
}