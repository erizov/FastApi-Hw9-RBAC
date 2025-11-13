import { useEffect, useState } from "react"

export const useRequestItem = (request) => {
      const [item, setItem] = useState(null);
      const [loading, setLoading] = useState(false);
      console.log(item  ,444)
    
      const loadData = () => {
        setLoading(true)
        request().then(setItem).finally(()=>setLoading(false))
      }
    
      useEffect(()=>{
        loadData()
      }, [] );

      return {loadData, loading, item}
}