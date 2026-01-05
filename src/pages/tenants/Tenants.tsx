import { useQuery } from "@tanstack/react-query";
import { getTenants } from "../../http/api";
import { useAuthStore } from "../../store";
import { Link, Navigate } from "react-router-dom";
import { Breadcrumb, Button, Drawer, Space, Table } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";
import TenantsFilter from "./TenantsFilter";
import { useState } from "react";

const columns = [
  {
    title: "ID",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "Name",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "Address",
    dataIndex: "address",
    key: "address",
  },
];

const Tenants = () => {
  const { user } = useAuthStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const {
    data: tenants,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["tenants"],
    queryFn: async () => {
      const res = await getTenants();
      console.log("Fetch data: ", res);
      return res.data;
    },
  });

  if (user?.role !== "admin") {
    return <Navigate to="/" replace={true} />;
  }

  return (
    <>
      <Space vertical style={{ width: "100%" }} size={"large"}>
        <Breadcrumb
          separator={<RightOutlined />}
          items={[
            { title: <Link to={"/"}>Dashboard</Link> },
            { title: "Tenants" },
          ]}
        />

        {isFetching && <div>Loading...</div>}
        {isError && <div>{error.message}</div>}

        <TenantsFilter
          onFilterChange={(filterName: string, filterValue: string) => {
            console.log(filterName);
            console.log(filterValue);
          }}
        >
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setDrawerOpen(true);
            }}
          >
            Add Restaurant
          </Button>
        </TenantsFilter>

        <Table dataSource={tenants} rowKey={"id"} columns={columns} />

        <Drawer
          size={720}
          title="Create Restaurant"
          destroyOnHidden={true}
          open={drawerOpen}
          onClose={() => {
            setDrawerOpen(false);
          }}
          extra={
            <Space>
              <Button>Cancel</Button>
              <Button type="primary">Submit</Button>
            </Space>
          }
        >
          <p>Some content</p>
        </Drawer>
      </Space>
    </>
  );
};

export default Tenants;
