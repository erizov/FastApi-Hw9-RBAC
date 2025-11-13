const formatData = (data) => {
  return Object.entries(data).map(([key, value])=>{
    return {key, ...value}
  })
}

export const requestVacancy = (authRequest) => {
    return authRequest('vacancy/').then((e)=>{
      return formatData(e)
    })
}

const toList = (e) => {
  const newTextArray = e.split('  \n').map(e=>e.trim());
  return newTextArray.reduce((acc, curr,idx)=>{
    if (idx%2===0) {
      const [idx, ...questions] = curr.split('.')
      const question = questions.join('.').trim().replace(/Вопрос: "/, '').slice(0,-1);
      return acc.concat({question, key: Number(idx)})
    } else {
      const lastItem = acc.pop();
      const answer = curr.replace(/Ответ: "/, '').slice(0,-1);
      return acc.concat({...lastItem, answer})
    }
  },[])
}

const toTextItem = (item) => {
  const question = `${item.key}. Вопрос: "${item.question}"`;
  const answer = `Ответ: "${item.answer}"`;
  return `${question}  \n   ${answer}`;
}

export const toText = (items) => {
  return items.map(toTextItem).join('  \n')
}

export const saveFAQ = (authRequest) => {
  return items => {
    const text = toText(items);
    return authRequest('base/faq/', {method: 'put', data: {text}})
  } 
}

export const requestFAQ = (authRequest) => {
    return authRequest('base/faq/').then((e)=>{
      return  toList(e.text)
    })
}


export const requestUsers = (authRequest) => {
    return authRequest('auth/users/').then((e)=>{
      return e.map(e=>({...e, key: e.id}))
    })
}

export const requestResume = (authRequest) => {
    return authRequest('resume/').then((e)=>{
      return formatData(e)
    })
}
export const requestEvaluate = (authRequest) => {
    return authRequest('evaluate/').then((e)=>{
      return formatData(e)
    })
}