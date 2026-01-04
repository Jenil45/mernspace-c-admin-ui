import { Breadcrumb, Space, Table } from "antd"
import {RightOutlined} from '@ant-design/icons';
import { Link, Navigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import type { User } from "../../types";
import { getUsers } from "../../http/api";
import { useAuthStore } from "../../store";
import UsersFilter from "./UsersFilters";

const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
    },
    {
        title: 'Name',
        dataIndex: 'firstName',
        key: 'firstName',
        render: (_text: string, record: User) => {
            return (
                <div>
                    {record.firstName} {record.lastName}
                </div>
            );
        },
    },
    {
        title: 'Email',
        dataIndex: 'email',
        key: 'email',
    },
    {
        title: 'Role',
        dataIndex: 'role',
        key: 'role',
    },
    {
        title: 'Restaurant',
        dataIndex: 'tenant',
        key: 'tenant',
        // render: (_text: string, record: User) => {
        //     return <div>{record.tenant?.name}</div>;
        // },
    },
];

const Users = () => {

    const {user} = useAuthStore();

    const {data: users, isFetching, isError, error} = useQuery({
        queryKey: ["users"],
        queryFn: async () => {
            const res = await getUsers();
            console.log("Fetch data: ", res);
            
            return res.data;
        },
    });

    if (user?.role !== 'admin') {
        return <Navigate to="/" replace={true} />;
    }

  return (
    <>
        <Space vertical style={{width: "100%"}} size={"large"}>
            <Breadcrumb separator={<RightOutlined />} items={[{ title: <Link to={"/"}>Dashboard</Link> }, {title: 'Users'}]} />
            {isFetching && <div>Loading...</div>}
            {isError && <div>{error.message}</div>}
            <UsersFilter />
            <Table  columns={columns} dataSource={users} />
        </Space>
    </>
  )
}

export default Users
