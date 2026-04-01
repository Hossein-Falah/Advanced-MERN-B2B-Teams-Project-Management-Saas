/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  useCallback,
} from 'react'
import { io, Socket } from 'socket.io-client'
import useWorkspaceId from '@/hooks/use-workspace-id'
import useAuth from '@/hooks/api/use-auth'
import { UserType, WorkspaceType } from '@/types/api.type'
import useGetWorkspaceQuery from '@/hooks/api/use-get-workspace'
import { useNavigate } from 'react-router-dom'
import usePermissions from '@/hooks/use-permissions'
import { PermissionType } from '@/constant'

// Define the context shape
type AuthContextType = {
  user?: UserType
  workspace?: WorkspaceType
  hasPermission: (permission: PermissionType) => boolean
  error: any
  isLoading: boolean
  isFetching: boolean
  workspaceLoading: boolean
  refetchAuth: () => void
  refetchWorkspace: () => void
  socket: Socket | null
  emitSocketEvent: (event: string, data?: any) => void
  isSocketConnected: boolean
  socketId: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const navigate = useNavigate()
  const workspaceId = useWorkspaceId()

  // اضافه کردن state برای Socket.IO
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isSocketConnected, setIsSocketConnected] = useState(false)
  const [socketId, setSocketId] = useState<string | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const {
    data: authData,
    error: authError,
    isLoading,
    isFetching,
    refetch: refetchAuth,
  } = useAuth()
  const user = authData?.user

  const {
    data: workspaceData,
    isLoading: workspaceLoading,
    error: workspaceError,
    refetch: refetchWorkspace,
  } = useGetWorkspaceQuery(workspaceId)

  const workspace = workspaceData?.workspace

  useEffect(() => {
    if (workspaceError) {
      navigate('/')
    }
  }, [navigate, workspaceError])

  // مدیریت ایجاد و بستن Socket.IO connection
  useEffect(() => {
    if (user && workspace) {
      // ایجاد اتصال Socket.IO
      const socketUrl = import.meta.env.VITE_SOCKET_URL

      const newSocket = io(socketUrl, {
        auth: {
          userId: user._id, // یا هر فیلد شناسه کاربر
        },
        transports: ['websocket'], // فقط از WebSocket استفاده کن
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      })

      // رویدادهای Socket.IO
      newSocket.on('connect', () => {
        console.log('✅ Socket.IO connected:', newSocket.id)
        setIsSocketConnected(true)
        // حل مشکل نوع‌دهی: بررسی کنید که socket.id وجود دارد
        if (newSocket.id) {
          setSocketId(newSocket.id)
        } else {
          setSocketId(null)
        }
      })

      newSocket.on('disconnect', (reason) => {
        console.log('❌ Socket.IO disconnected:', reason)
        setIsSocketConnected(false)
        setSocketId(null)
      })

      newSocket.on('connect_error', (error) => {
        console.error('Socket.IO connection error:', error)
        setIsSocketConnected(false)
        setSocketId(null)
      })

      newSocket.on('error', (error) => {
        console.error('Socket.IO error:', error)
      })

      socketRef.current = newSocket
      setSocket(newSocket)

      // اتصال را فعال کن
      newSocket.connect()
    } else {
      // بستن اتصال اگر کاربر یا ورک‌اسپیس وجود ندارد
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsSocketConnected(false)
        setSocketId(null)
      }
    }

    // پاک‌سازی هنگام unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setIsSocketConnected(false)
        setSocketId(null)
      }
    }
  }, [user, workspace])

  // تابع برای ارسال event از طریق Socket.IO
  const emitSocketEvent = useCallback((event: string, data?: any) => {
    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit(event, data)
    } else {
      console.warn('Socket.IO is not connected')
    }
  }, [])

  const permissions = usePermissions(user, workspace)

  const hasPermission = (permission: PermissionType): boolean => {
    return permissions.includes(permission)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        workspace,
        hasPermission,
        error: authError || workspaceError,
        isLoading,
        isFetching,
        workspaceLoading,
        refetchAuth,
        refetchWorkspace,
        socket,
        emitSocketEvent,
        isSocketConnected,
        socketId,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useCurrentUserContext must be used within a AuthProvider')
  }
  return context
}
