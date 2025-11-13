import { useEffect, useState } from "react"

export const useRequestData = (request) => {
      const [items, setItems] = useState([]);
      const [loading, setLoading] = useState(false);
    
      const loadData = () => {
        setLoading(true)
        request().then(setItems).finally(()=>setLoading(false))
      }
    
      useEffect(()=>{
        loadData()
      }, [] );

      return {loadData, loading, items}
}