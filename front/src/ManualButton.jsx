import { Button } from "antd";

export const ManualButton = (props) => {
    const {type, onClick} = props;
    switch (type) {
        case 'Create':
            return <Button type='primary' onClick={onClick}>Add</Button>
        case 'Edit':
            return <Button type='link' onClick={onClick}>Edit</Button>
        case 'Generate':
            return <Button type='default' onClick={onClick}>Generate</Button>
        case 'Ask':
            return <Button type='default' onClick={onClick}>Ask</Button>
    }
}