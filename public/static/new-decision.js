// New Decision JavaScript
// 새 소비 판단 페이지 로직

// 질문 정의
const QUESTIONS = [
  {
    id: 'q1_necessity',
    type: 'slider',
    question: 'Q1. 이 물건이 없으면 일상에 얼마나 불편해?',
    subtext: '직감으로 찍어도 괜찮아요.',
    min: 0,
    max: 5,
    labels: ['거의 상관없음', '조금 불편', '보통', '꽤 불편', '매우 불편', '필수적']
  },
  {
    id: 'q2_has_similar',
    type: 'toggle',
    question: 'Q2. 비슷한 기능 하는 물건 이미 갖고 있어?',
    subtext: '집에 굴러다니는 것도 포함해요.',
    options: ['예', '아니오']
  },
  {
    id: 'q3_future_use',
    type: 'slider',
    question: 'Q3. 3개월 뒤에도 최소 주 1회 이상 쓸 것 같아?',
    subtext: '직감으로 찍어도 괜찮아요.',
    min: 0,
    max: 5,
    labels: ['거의 안 쓸듯', '월 1회', '월 2-3회', '주 1회', '주 2-3회', '거의 매일']
  },
  {
    id: 'q4_budget_burden',
    type: 'slider',
    question: 'Q4. 이 금액이 이번 달 내 수입 대비 얼마나 부담돼?',
    subtext: '솔직하게 답해야 정확해요.',
    min: 0,
    max: 5,
    labels: ['부담없음', '조금 부담', '보통', '꽤 부담', '매우 부담', '감당 불가']
  },
  {
    id: 'q5_emotional_state',
    type: 'radio',
    question: 'Q5. 지금 내 상태는?',
    subtext: '감정이 소비에 영향을 줄 수 있어요.',
    options: ['평온', '스트레스', '우울', '텐션 업']
  },
  {
    id: 'q6_purchase_trigger',
    type: 'radio',
    question: 'Q6. 이걸 사려는 계기?',
    subtext: '정직하게 체크해보세요.',
    options: ['실제 필요', '지인 추천', '광고·SNS 보고', '그냥 눈에 띄어서']
  },
  {
    id: 'q7_can_wait',
    type: 'toggle',
    question: 'Q7. 1~2주 뒤에 사도 상관없지?',
    subtext: '급한 게 아니면 시간을 두고 생각해요.',
    options: ['예', '아니오']
  },
  {
    id: 'q8_maintenance_cost',
    type: 'radio',
    question: 'Q8. 추가 유지비/구독료/소모품 들어가는 물건이야?',
    subtext: '숨은 비용이 있을 수 있어요.',
    options: ['예', '아니오', '잘 모르겠음']
  }
]

// 슬라이더 렌더링
function renderSlider(question) {
  const currentValue = document.getElementById(question.id)?.value || 0
  
  return `
    <div class="space-y-2">
      <label class="block text-gray-700 font-medium">${question.question}</label>
      ${question.subtext ? `<p class="text-sm text-gray-500 italic">${question.subtext}</p>` : ''}
      <div class="flex items-center space-x-4">
        <span class="text-sm text-gray-500 w-20">0</span>
        <input type="range" id="${question.id}" 
               min="${question.min}" max="${question.max}" value="${currentValue}"
               class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
               oninput="updateSliderLabel('${question.id}')">
        <span class="text-sm text-gray-500 w-20 text-right">${question.max}</span>
      </div>
      <div class="text-center">
        <span id="${question.id}_label" class="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
          ${question.labels[currentValue]}
        </span>
      </div>
    </div>
  `
}

// 토글 렌더링
function renderToggle(question) {
  return `
    <div class="space-y-2">
      <label class="block text-gray-700 font-medium">${question.question}</label>
      ${question.subtext ? `<p class="text-sm text-gray-500 italic">${question.subtext}</p>` : ''}
      <div class="flex space-x-4">
        ${question.options.map(option => `
          <label class="flex-1 cursor-pointer">
            <input type="radio" name="${question.id}" value="${option}" class="hidden peer" required>
            <div class="px-6 py-3 text-center border-2 border-gray-300 rounded-lg peer-checked:border-purple-600 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:border-purple-400 transition">
              ${option}
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `
}

// 라디오 버튼 렌더링
function renderRadio(question) {
  return `
    <div class="space-y-2">
      <label class="block text-gray-700 font-medium">${question.question}</label>
      ${question.subtext ? `<p class="text-sm text-gray-500 italic">${question.subtext}</p>` : ''}
      <div class="grid grid-cols-2 gap-3">
        ${question.options.map(option => `
          <label class="cursor-pointer">
            <input type="radio" name="${question.id}" value="${option}" class="hidden peer" required>
            <div class="px-4 py-3 text-center border-2 border-gray-300 rounded-lg peer-checked:border-purple-600 peer-checked:bg-purple-50 peer-checked:text-purple-700 hover:border-purple-400 transition">
              ${option}
            </div>
          </label>
        `).join('')}
      </div>
    </div>
  `
}

// 질문 렌더링
function renderQuestion(question) {
  switch (question.type) {
    case 'slider':
      return renderSlider(question)
    case 'toggle':
      return renderToggle(question)
    case 'radio':
      return renderRadio(question)
    default:
      return ''
  }
}

// 슬라이더 라벨 업데이트
function updateSliderLabel(questionId) {
  const slider = document.getElementById(questionId)
  const label = document.getElementById(`${questionId}_label`)
  const question = QUESTIONS.find(q => q.id === questionId)
  
  if (slider && label && question) {
    label.textContent = question.labels[slider.value]
  }
}

// 폼 데이터 수집
function collectFormData() {
  const formData = {
    item_name: document.getElementById('item_name').value,
    price: parseFloat(document.getElementById('price').value),
    category: document.getElementById('category').value
  }

  QUESTIONS.forEach(question => {
    if (question.type === 'slider') {
      formData[question.id] = parseInt(document.getElementById(question.id).value)
    } else {
      const selected = document.querySelector(`input[name="${question.id}"]:checked`)
      if (selected) {
        formData[question.id] = selected.value
      }
    }
  })

  return formData
}

// 폼 제출
async function handleSubmit(event) {
  event.preventDefault()

  const submitButton = event.target.querySelector('button[type="submit"]')
  const originalText = submitButton.innerHTML
  submitButton.disabled = true
  submitButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>계산 중...'

  try {
    const formData = collectFormData()
    
    const response = await axios.post('/api/decisions', formData)

    if (response.data.success) {
      const decision = response.data.data
      
      // 48시간 보류인 경우 알림 설정
      if (decision.conclusion === '48시간 보류' && typeof window.savePendingReminder === 'function') {
        window.savePendingReminder(decision)
        
        // 알림 권한이 없으면 요청
        if (Notification && Notification.permission === 'default') {
          setTimeout(() => {
            window.showNotificationPermissionPrompt()
          }, 1000)
        }
      }
      
      // 결과 페이지로 이동
      window.location.href = `/result/${decision.id}`
    } else {
      alert('오류: ' + response.data.error)
      submitButton.disabled = false
      submitButton.innerHTML = originalText
    }
  } catch (error) {
    console.error('Error submitting form:', error)
    alert('소비 판단을 생성하는데 실패했습니다. 다시 시도해주세요.')
    submitButton.disabled = false
    submitButton.innerHTML = originalText
  }
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
  // 질문 렌더링
  const questionsContainer = document.getElementById('questions')
  questionsContainer.innerHTML = QUESTIONS.map(q => `
    <div class="bg-gray-50 p-4 rounded-lg">
      ${renderQuestion(q)}
    </div>
  `).join('')

  // 폼 제출 이벤트
  document.getElementById('purchase-form').addEventListener('submit', handleSubmit)

  // 슬라이더 초기 라벨 설정
  QUESTIONS.filter(q => q.type === 'slider').forEach(q => {
    updateSliderLabel(q.id)
  })
})
