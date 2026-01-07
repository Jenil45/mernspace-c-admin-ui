import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTenants, getTenants } from "../../http/api";
import { useAuthStore } from "../../store";
import { Link, Navigate } from "react-router-dom";
import { Breadcrumb, Button, Drawer, Form, Space, Table } from "antd";
import { RightOutlined } from "@ant-design/icons";
import { PlusOutlined } from "@ant-design/icons";
import TenantsFilter from "./TenantsFilter";
import { useState } from "react";
import type { CreateTenantData } from "../../types";
import TenantForm from "./forms/TenantForm";

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
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

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

  const { mutate: tenantMutate } = useMutation({
    mutationKey: ["addTenant"],
    mutationFn: async (data: CreateTenantData) =>
      createTenants(data).then((res) => res.data),
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["tenants"] });
      return;
    },
  });

  const onHandleSubmit = async () => {
    await form.validateFields();
    await tenantMutate(form.getFieldsValue());
    form.resetFields();
    setDrawerOpen(false);
  };

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
            form.resetFields();
          }}
          extra={
            <Space>
              <Button
                onClick={() => {
                  form.resetFields();
                  setDrawerOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" onClick={onHandleSubmit}>Submit</Button>
            </Space>
          }
        >
          <Form layout="vertical" form={form}>
            <TenantForm />
          </Form>
        </Drawer>
      </Space>
    </>
  );
};

export default Tenants;
