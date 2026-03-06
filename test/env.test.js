import 'dotenv/config'

test.skip('DEEPSEEK_API_KEY should exist', () => {
  expect(process.env.DEEPSEEK_API_KEY).toBeDefined()
})