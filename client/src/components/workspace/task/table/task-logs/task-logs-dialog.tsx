// src/components/task-logs/task-logs-dialog.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { TaskType } from '@/types/api.type'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { format as formatJalali } from 'date-fns-jalali'
import { faIR } from 'date-fns-jalali/locale'
import LogsList from './logs-list'
import LogDetails from './log-details'
import { useState, useEffect } from 'react'
import { TaskLogType } from '@/types/task-logs.type'
import {
  getAllTaskLogsQueryFn,
  redoTaskLog,
  undoTaskLog,
} from '@/lib/api/task-logs-api'
import useWorkspaceId from '@/hooks/use-workspace-id'

const TaskLogsDialog = ({
  task,
  isOpen,
  onClose,
}: {
  task: TaskType & Record<string, any>
  isOpen: boolean
  onClose: () => void
}) => {
  const queryClient = useQueryClient()
  const [selectedLog, setSelectedLog] = useState<TaskLogType | null>(null)
  const workspaceId = useWorkspaceId()
  const { data, isLoading } = useQuery({
    queryKey: ['task-logs', task?.workspace, task?._id],
    queryFn: () =>
      getAllTaskLogsQueryFn({
        taskId: task.id,
      }),
    enabled: isOpen && !!task?._id && !!task?.workspace,
  })

  const logs = data?.logs.filter((l) => l.action == 'UPDATE') ?? []

  // وقتی مودال باز شد و لاگ‌ها آمدند، به صورت پیش‌فرض آخری را انتخاب کن
  useEffect(() => {
    if (isOpen && logs.length > 0) {
      setSelectedLog((prev) => prev || logs[0])
    }
    if (!isOpen) {
      setSelectedLog(null)
    }
  }, [isOpen, logs])

  // Undo mutation
  const undoMutation = useMutation({
    mutationFn: (logId: string) =>
      undoTaskLog({
        logId,
        taskId: task._id,
        workspaceId: workspaceId,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-logs', workspaceId, task?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['all-tasks', workspaceId],
      })
    },
  })

  // Redo mutation
  const redoMutation = useMutation({
    mutationFn: (logId: string) =>
      redoTaskLog({
        logId,
        taskId: task._id,
        workspaceId: task.workspace,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task-logs', workspaceId, task?.id],
      })

      queryClient.invalidateQueries({
        queryKey: ['all-tasks', workspaceId],
      })
    },
  })

  if (!task) return null

  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-3xl my-5 border-0'>
        <DialogHeader>
          <DialogTitle className='mt-4 flex flex-col gap-2 md:flex-row justify-between break-all'>
            <p>تاریخچه تغییرات - {task?.title}</p>
            <p className='text-xs font-normal '>
              {task.dueDate
                ? formatJalali(new Date(task.dueDate), 'PPP HH:mm', {
                    locale: faIR,
                  })
                : null}
            </p>
          </DialogTitle>
        </DialogHeader>

        {/* layout دو ستونه: لیست لاگ‌ها + جزئیات */}
        <div className='mt-4 grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4'>
          <LogsList
            logs={logs}
            selectedLogId={selectedLog?._id ?? null}
            onSelectLog={(log) => setSelectedLog(log)}
            isLoading={isLoading}
          />
          <LogDetails
            log={selectedLog}
            task={task}
            onUndo={(logId) => undoMutation.mutate(logId)}
            onRedo={(logId) => redoMutation.mutate(logId)}
            isUndoLoading={undoMutation.isPending}
            isRedoLoading={redoMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TaskLogsDialog
