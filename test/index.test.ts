import { createFetchError, fetchRP } from '#src/index.js'
import { describe, expect, it } from 'vitest'

const fetchTodo = () => fetch('https://jsonplaceholder.typicode.com/todos/1')

const fetchHttpBinWithStatus = (statusCode: number) => fetch(`https://httpbin.org/status/${statusCode}`)

describe('fast smoketests', () => {
  it('should auto parse the json', async () => {
    // Expect
    expect(await fetchRP(fetchTodo())).toMatchInlineSnapshot(`
      {
        "completed": false,
        "id": 1,
        "title": "delectus aut autem",
        "userId": 1,
      }
    `)
  })

  it('should be able to force a specific response type', async () => {
    // Expect
    expect(await fetchRP(fetchTodo(), { detectResponseType: () => 'blob' })).toMatchInlineSnapshot(`
      Blob {
        Symbol(kHandle): Blob {},
        Symbol(kLength): 83,
        Symbol(kType): "application/json;charset=utf-8",
      }
    `)
  })

  it('should throw if the response is not ok - 404', async () => {
    // Expect
    await expect(fetchRP(fetchHttpBinWithStatus(404))).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: 404 NOT FOUND]`)
  })

  it('should throw if the response is not ok - 500', async () => {
    // Expect
    await expect(fetchRP(fetchHttpBinWithStatus(500))).rejects.toThrowErrorMatchingInlineSnapshot(`[Error: 500 INTERNAL SERVER ERROR]`)
  })
})

describe('some other coverage stuff', () => {
  it('should be able to create empty fetch error', async () => {
    // Expect
    expect(createFetchError()).toMatchInlineSnapshot(`[Error: <no response>]`)
  })
})
