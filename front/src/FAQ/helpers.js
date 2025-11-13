export const nextId = (items) => {
    if (!items.length) return 1;
    return items.at(-1).key+1;
}

export const addItems = (items, item) => {
    const id = nextId(items);
    const newItem = {...item, key: id}
    return items.concat(newItem)
} 

export const deleteItem = (items, key) => {
    return items.filter(e=>e.key!==key).map((item, idx)=>{
        return {...item, key: idx+1}
    })
}

export const editItem = (items, item) => {
    return items.map(e=>{
        if (e.key!==item.key) return e;
        return item
    });
}