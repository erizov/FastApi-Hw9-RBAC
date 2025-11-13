import { Flex, Tabs } from "antd"
import { Users } from "./Users"
import { FAQ } from "./FAQ";
import { useState } from "react";
import { Evaluate } from "./Evaluate";
import { Chat } from "./Chat";
import { Profile } from "./Profile";

export const RootApp = (props) => {
    const {authRequest, user} = props;

        const [tab, setTab] = useState(localStorage.getItem('activeKey') ?? '1');

    const saveTab = (activeKey) => {
        setTab(activeKey)
        localStorage.setItem('activeKey', activeKey)
    }

    const items = [
        {key:'1', label:'Chat', children: <Chat user={user}  authRequest={authRequest}/>},
        {key:'2', label:'Profile', children: <Profile user={user} authRequest={authRequest}/>},
    ]

    if (user.is_admin) {
        items.push({key:'3', label:'Users', children: <Users user={user} authRequest={authRequest}/>})
        items.push({key:'4', label:'FAQ', children: <FAQ user={user} authRequest={authRequest}/>})
    }

    return (
        
         <Tabs
    activeKey={tab}
    onChange={saveTab} 
    items={items}
    />
    )
}
