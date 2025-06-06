// components/CourseGrid.jsx - 课程网格组件
import React from 'react';
import { styles } from '../styles/index.js';
import { ethers } from "ethers";

export default function CourseGrid({ courses, onPurchase, loading,onAddCourse}) {

  if (courses.length == 0) {
    return (
      <div>
        <div style={styles.tabContainer}>
          <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
            📚 课程商城
          </h3>
          <button style={{ ...styles.tab }} className="button-hover" onClick={() => onAddCourse()}>
            增加课程
          </button>
        </div>

        <div style={{ ...styles.card, textAlign: 'center', color: 'white' }}>
          暂无课程，敬请期待...
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.tabContainer}>
        <h3 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
          📚 课程商城
        </h3>
        <button style={{ ...styles.tab }} className="button-hover" onClick={() => onAddCourse()}>
            增加课程
          </button>
      </div>
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
            { !loading ? (
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