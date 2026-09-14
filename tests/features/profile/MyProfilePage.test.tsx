import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as authApi from '@/api/auth'
import { MyProfilePage } from '@/features/profile/MyProfilePage'
import { createTestQueryClient } from '../../support/testProviders'
import type { User } from '@/types/user'

vi.mock('@/api/auth')
const mockedAuthApi = vi.mocked(authApi, true)

const user: User = { id: 1, uuid: 'me-uuid', name: 'Ada', lastname: 'Lovelace', email: 'ada@example.com' }
const updateUser = vi.fn()
const logout = vi.fn()
const showToast = vi.fn()
vi.mock('@/context/AuthContext', () => ({ useAuth: () => ({ user, updateUser, logout }) }))
vi.mock('@/context/ToastContext', () => ({ useToast: () => ({ showToast }) }))

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:preview'), revokeObjectURL: vi.fn() })
})

function renderPage() {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={['/profile/me']}>
        <Routes>
          <Route path="/profile/me" element={<MyProfilePage />} />
          <Route path="/login" element={<div>Login page</div>} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('MyProfilePage', () => {
  it("shows the current user's name and email", () => {
    renderPage()
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.getByText('ada@example.com')).toBeInTheDocument()
  })

  it('saves the edited name/lastname and shows a success toast', async () => {
    mockedAuthApi.updateMe.mockResolvedValue({ ...user, name: 'Grace' })
    renderPage()

    const nameInput = screen.getByLabelText('Name')
    await userEvent.clear(nameInput)
    await userEvent.type(nameInput, 'Grace')
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))

    await waitFor(() => expect(mockedAuthApi.updateMe).toHaveBeenCalledWith({ name: 'Grace', lastname: 'Lovelace' }))
    expect(updateUser).toHaveBeenCalledWith({ ...user, name: 'Grace' })
    expect(showToast).toHaveBeenCalledWith('Profile updated', 'success')
  })

  it('shows an error banner when saving fails', async () => {
    mockedAuthApi.updateMe.mockRejectedValue(new Error('boom'))
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Save changes' }))
    await waitFor(() => expect(screen.getByText('Something went wrong. Please try again.')).toBeInTheDocument())
  })

  it('rejects an unsupported avatar file type without calling the API', () => {
    renderPage()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const badFile = new File(['x'], 'doc.pdf', { type: 'application/pdf' })

    // userEvent.upload respects the input's `accept` filter; fireEvent reaches the
    // component's own JS-side validation directly, same as MediaUploadField's test.
    fireEvent.change(input, { target: { files: [badFile] } })

    expect(showToast).toHaveBeenCalledWith("That file type isn't supported for a profile photo.", 'error')
    expect(mockedAuthApi.updateMe).not.toHaveBeenCalled()
  })

  it('uploads a valid avatar file and shows a success toast', async () => {
    mockedAuthApi.updateMe.mockResolvedValue({ ...user, avatar_url: 'new.png' })
    renderPage()
    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    const file = new File(['x'], 'avatar.png', { type: 'image/png' })

    await userEvent.upload(input, file)

    await waitFor(() => expect(mockedAuthApi.updateMe).toHaveBeenCalledWith({ avatar: file }))
    expect(showToast).toHaveBeenCalledWith('Profile photo updated', 'success')
  })

  it('deletes the account after confirming, then logs out and navigates to /login', async () => {
    mockedAuthApi.deleteMe.mockResolvedValue(undefined)
    logout.mockResolvedValue(undefined)
    renderPage()

    await userEvent.click(screen.getByRole('button', { name: 'Delete account' }))
    const dialog = screen.getByRole('dialog', { name: 'Delete account' })
    await userEvent.click(within(dialog).getByRole('button', { name: 'Delete account' }))

    await waitFor(() => expect(mockedAuthApi.deleteMe).toHaveBeenCalledTimes(1))
    expect(logout).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(screen.getByText('Login page')).toBeInTheDocument())
  })
})
