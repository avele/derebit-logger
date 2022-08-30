import WebSocket from 'ws'
import {paths as DerebitRequests} from './derebitSchema'

let lastRequestId = 0

type DerebitPath = keyof DerebitRequests

type DerebitPathRequestParams<T extends DerebitPath> =
  DerebitRequests[T]['get'] extends {
    parameters: {query: infer R}
  }
    ? R
    : never

type DerebitPathResponse<T extends DerebitPath> =
  DerebitRequests[T]['get']['responses'] extends {
    200: {
      content: {
        'application/json': {
          result: infer R
        }
      }
    }
  }
    ? R
    : never

type Request<T extends DerebitPath> = {
  id: number
  method: T
  params: DerebitPathRequestParams<T>
  jsonrpc: '2.0'
}

type InstrumentInfo = DerebitPathResponse<'public/ticker'>

function createRequest<T extends DerebitPath>(
  path: T,
  params: DerebitPathRequestParams<T>
): Request<T> {
  const id = ++lastRequestId
  return {
    id,
    method: path,
    params,
    jsonrpc: '2.0',
  }
}

async function sendRequestAndWaitForResponse<T extends DerebitPath>(
  ws: WebSocket,
  path: T,
  params: DerebitPathRequestParams<T>
): Promise<DerebitPathResponse<T>> {
  const request = createRequest(path, params)
  ws.send(JSON.stringify(request))

  return new Promise((resolve, reject) => {
    const onMessage = (message: string) => {
      const response = JSON.parse(message)
      if (response.id === request.id) {
        ws.removeListener('message', onMessage)
        if (response.error) {
          reject(response.error)
        } else {
          resolve(response.result)
        }
      }
    }
    ws.on('message', onMessage)
  })
}

async function connect() {
  const ws = new WebSocket('wss://www.deribit.com/ws/api/v2')
  return new Promise<WebSocket>(resolve => {
    ws.on('open', () => resolve(ws))
  })
}

async function getOrderBook(ws: WebSocket, instrumentName: string) {
  const orderBook = await sendRequestAndWaitForResponse(
    ws,
    'public/get_order_book',
    {
      instrument_name: instrumentName,
    }
  )
  return orderBook
}

export async function getOrderBooks<T extends string[]>(instrumentNames: T) {
  console.log('Get Derebit IVs: Waiting for connection...')
  const ws = await connect()
  console.log('Get Derebit IVs: Connected!')

  const orderBooks: {
    [K in keyof T]?: Awaited<ReturnType<typeof getOrderBook>>
  } = {}

  for (const instrumentName of instrumentNames) {
    console.log(`Get Derebit IVs: Getting order book for ${instrumentName}...`)
    const orderBook = await getOrderBook(ws, instrumentName)
    orderBooks[instrumentName as keyof T] = orderBook
    console.log(`Get Derebit IVs: Got order book for ${instrumentName}!`)
    console.log(orderBook)
  }

  console.log('Get Derebit IVs: Finished and closed connection')
  return orderBooks
}
