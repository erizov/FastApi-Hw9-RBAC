import { DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { Bubble, Sender, useXAgent, useXChat } from '@ant-design/x';
import { Button, Flex, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { LoremIpsum } from "lorem-ipsum";


const lorem = new LoremIpsum({
  sentencesPerParagraph: {
    max: 8,
    min: 4
  },
  wordsPerSentence: {
    max: 16,
    min: 4
  }
});

lorem.generateWords(1);

const items = [];

const createMessage = (params) => {
    return {
        role:params.role,
        content: params.user_input
    }
}

const clearRequest = (params) => {
    if ('client_id' in params) {
        return new Promise(res=>{
            return setTimeout(()=>{
                items.length = 0
                res();
            }, 1500)
        });
    } 
    return Promise.reject('Invalid body in mockRequest')
}

const mockRequest = (params) => {
    if ('user_input' in params && 'client_id' in params) {
        return new Promise(res=>{
            return setTimeout(()=>{
                const user = createMessage({role:'user', user_input: params.user_input})
                const bot = createMessage({role:'assistant', user_input: lorem.generateSentences(2)})
                items.push(user)
                items.push(bot)
                res(undefined);
            }, 1500)
        });
    } 
    return Promise.reject('Invalid body in mockRequest')
}

const mockDialog = (params) => {
    if ('client_id' in params) {
        return new Promise(res=>{
            return setTimeout(()=>res({
                client_id: params.client_id,
                history: items,
            }), 1500)
        });
    } 
    return Promise.reject('Invalid body in mockDialog')
}

const sleep = () => new Promise((resolve) => setTimeout(resolve, 1000));

const roles = {
  ai: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#fde3cf' } },
    typing: { step: 5, interval: 20 },
    style: {
      maxWidth: 600,
    },
  },
  local: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
};

export const Chat = (props) => {
    const {authRequest, user} = props;
  const [content, setContent] = React.useState('');
  const client_id = user.id;

  const requestDialog = () => {
// return mockDialog({client_id})
    return authRequest(`dialog/history/${client_id}`)
  }

  const clearDialog = () => {
    return authRequest('/dialog/clear', {method:'post', data:{client_id}})
  }

  const requestStep = (message) => {
    return authRequest('/dialog/request', {method:'post', data: {client_id, user_input: message}}).then(()=>requestDialog())
  }

  // Agent for request
  const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError }) => {
      await sleep();
      await requestStep(message).then((e)=>{
        const message = e.history.at(-1).content
        onSuccess([message]);
      }).catch(()=>{
        onError(new Error('Request failed'));
      })
    },
  });

  // Chat messages
  const { onRequest, messages, setMessages } = useXChat({
    agent,
    requestPlaceholder: 'Waiting...',
    requestFallback: 'Mock failed return. Please try again later.',
  });
  console.log(messages)

  useEffect(()=>{
    requestDialog().then(e=>{
        const newMessages = e.history.map((e, idx)=>({id: idx.toString(), message:e.content,
             status: e.role==='user'? 'local' : 'Success'}))
        setMessages(newMessages)
    });
  },[]);

  const [loading, setLoading] = useState(false);

  const onClear = () => {
    setLoading(true)
    // clearRequest({client_id})
    clearDialog()
    .then(()=>{
        setMessages([])
    }).finally(()=>{
        setLoading(false)
    })
  }

  return (
    <Flex vertical gap="middle" flex={1} style={{padding:'24px'}}>
      <Bubble.List
        roles={roles}
        style={{ height: 300 }}
        items={messages.map(({ id, message, status }) => ({
          key: id,
          loading: status === 'loading',
          role: status === 'local' ? 'local' : 'ai',
          content: message,
        }))}
      />
      <Flex align='center' gap={8}>
        <Button disabled={agent.isRequesting()} loading={loading} danger icon={<DeleteOutlined/>} onClick={onClear}/>
      <Sender
        loading={agent.isRequesting()}
        value={content}
        disabled={loading}
        onChange={setContent}
        onSubmit={(nextContent) => {
            onRequest(nextContent);
            setContent('');
        }}
        />
        </Flex>
    </Flex>
  );
};