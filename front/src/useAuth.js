import { useEffect, useState } from "react"
import axios from 'axios';

const API_URL = 'http://localhost:8000/';

const getToken = () => {
    return localStorage.getItem('token');
}
const saveToken = (token) => {
    return localStorage.setItem('token', token);
}
const clearToken = () => {
    return localStorage.removeItem('token');
}

const getUser = () => {
    const user = localStorage.getItem('user');
    if (!user) return null;
    return JSON.parse(user)
}
const saveUser = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
}
const clearUser = () => {
    return localStorage.removeItem('user');
}

export const useAuth = () => {
    const [user, setUser] = useState(null)

      const fetchHandler = async (url, options = {}) => {
    console.log({
        baseURL:API_URL,
        url,
        ...options,
        headers: {
          ...options.headers,
        },
      })
    try {
      const response = await axios.request({
        baseURL:API_URL,
        url,
        ...options,
        headers: {
          ...options.headers,
        },
      });
      const data = response.data;
      if (response.status>=300) {
        throw new Error(data.message ?? 'Request failed');
      }
      
      return data;
    } catch (error) {
      console.error('API Error:', error.message);
      throw error;
    }
  };

    useEffect(()=>{
        const token = getToken()
        const user = getUser()
        if (!token || !user) return;
        setUser(user)
    }, []);

    const register = async ({login, password, name}) =>{
        await fetchHandler(`auth/register/`, {
        method: 'post',
        data:{login, password, name, is_admin: false},
      });
    }

    const login = async ({ username, password }) => {
      const data = new FormData();
      data.set('password', password);
      data.set('username', username)
      const response = await fetchHandler(`auth/token/`, {
        method: 'post',
        data,
      });
      setUser(response.user)
      saveUser(response.user)
      saveToken(response.access_token)
    };

    const logout = () => {
        clearUser()
        clearToken()
    }

      // Защищенный запрос с автоматическим обновлением токена
  const authRequest = async (url, options = {}) => {
    const token = getToken('token');
    
    try {
      // Первая попытка запроса
      return await fetchHandler(url, {
        ...options,
        headers: {
          ...options.headers,
          Authorization: `Bearer ${token}`,
        },
      });
    } catch {
        logout();
      }
    }

    return {login, logout, isAuthenticated:user!==null, user, authRequest, register}
}
