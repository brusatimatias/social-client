import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as postsApi from '@/api/posts'
import { apiClient } from '@/api/client'
import type { PostInput } from '@/api/posts'

vi.mock('@/api/client', () => ({
  apiClient: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}))

const mockedClient = vi.mocked(apiClient, true)

beforeEach(() => {
  vi.clearAllMocks()
})

const baseInput: PostInput = { content: 'hello', visibility: 'public', status: 'published' }

describe('listMyPosts', () => {
  it('fetches /posts with no params when status is omitted', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    await postsApi.listMyPosts()
    expect(mockedClient.get).toHaveBeenCalledWith('/posts', { params: undefined })
  })

  it('fetches /posts filtered by status', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [] } })
    await postsApi.listMyPosts('draft')
    expect(mockedClient.get).toHaveBeenCalledWith('/posts', { params: { status: 'draft' } })
  })
})

describe('getPost', () => {
  it('fetches a single post by id', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: { id: 1 } } })
    const post = await postsApi.getPost(1)
    expect(mockedClient.get).toHaveBeenCalledWith('/posts/1')
    expect(post).toEqual({ id: 1 })
  })
})

describe('createPost / updatePost', () => {
  it('creates a post as plain JSON when there is no media', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: {} } })
    await postsApi.createPost(baseInput)
    expect(mockedClient.post).toHaveBeenCalledWith('/posts', {
      post: { content: 'hello', visibility: 'public', status: 'published' },
    })
  })

  it('creates a post as multipart FormData when media files are present', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: {} } })
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    await postsApi.createPost({ ...baseInput, media: [file] })

    const [url, body] = mockedClient.post.mock.calls[0]
    expect(url).toBe('/posts')
    expect(body).toBeInstanceOf(FormData)
    const form = body as FormData
    expect(form.get('post[content]')).toBe('hello')
    expect(form.get('post[visibility]')).toBe('public')
    expect(form.get('post[status]')).toBe('published')
    expect(form.getAll('post[media][]')).toEqual([file])
  })

  it('appends every file for multiple media uploads', async () => {
    mockedClient.post.mockResolvedValue({ data: { data: {} } })
    const fileA = new File(['a'], 'a.png', { type: 'image/png' })
    const fileB = new File(['b'], 'b.png', { type: 'image/png' })
    await postsApi.createPost({ ...baseInput, media: [fileA, fileB] })

    const form = mockedClient.post.mock.calls[0][1] as FormData
    expect(form.getAll('post[media][]')).toEqual([fileA, fileB])
  })

  it('updates a post as plain JSON when there is no media', async () => {
    mockedClient.patch.mockResolvedValue({ data: { data: {} } })
    await postsApi.updatePost(5, baseInput)
    expect(mockedClient.patch).toHaveBeenCalledWith('/posts/5', {
      post: { content: 'hello', visibility: 'public', status: 'published' },
    })
  })

  it('updates a post as multipart FormData when media files are present', async () => {
    mockedClient.patch.mockResolvedValue({ data: { data: {} } })
    const file = new File(['x'], 'photo.png', { type: 'image/png' })
    await postsApi.updatePost(5, { ...baseInput, media: [file] })

    const [url, body] = mockedClient.patch.mock.calls[0]
    expect(url).toBe('/posts/5')
    expect(body).toBeInstanceOf(FormData)
  })
})

describe('deletePost', () => {
  it('calls DELETE /posts/:id', async () => {
    mockedClient.delete.mockResolvedValue({ data: {} })
    await postsApi.deletePost(7)
    expect(mockedClient.delete).toHaveBeenCalledWith('/posts/7')
  })
})

describe('getFeed', () => {
  it('returns posts and meta from the envelope', async () => {
    mockedClient.get.mockResolvedValue({
      data: { data: [{ id: 1 }], meta: { current_page: 1, total_pages: 3 } },
    })
    const result = await postsApi.getFeed({ page: 1, per_page: 20 })
    expect(mockedClient.get).toHaveBeenCalledWith('/feed', { params: { page: 1, per_page: 20 } })
    expect(result).toEqual({ posts: [{ id: 1 }], meta: { current_page: 1, total_pages: 3 } })
  })

  it('defaults params to an empty object', async () => {
    mockedClient.get.mockResolvedValue({ data: { data: [], meta: {} } })
    await postsApi.getFeed()
    expect(mockedClient.get).toHaveBeenCalledWith('/feed', { params: {} })
  })
})
