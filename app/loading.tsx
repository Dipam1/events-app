import { Spin } from "antd"

const Loading = () => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <Spin size="large" />
    </div>
  )
}

export default Loading