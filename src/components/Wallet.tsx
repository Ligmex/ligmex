import { useConnect } from 'wagmi'

export const Wallet = () => {
  const { connect, connectors, error, isLoading, pendingConnector } =
    useConnect()

  console.log("connect: ", connect)
  console.log("Connectors: ", connectors);
  console.log("error: ", error);
  return (
    <div>
      {connectors.map((connector) => (
        <button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect({ connector })}
        >
          {connector.name}
        </button>
      ))}

      {error && <div>{error.message}</div>}
    </div>
  )
}
