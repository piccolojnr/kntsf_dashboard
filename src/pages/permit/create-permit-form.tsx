import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { AlertCircle, CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { usePermitCreation } from '@/hooks/use-permit-creation'
import { useAuth } from '@/lib/auth/auth.context'
import { permitFormSchema, PermitFormValues } from '@/lib/schemas/permit-schema'
import { cn } from '@/lib/utils'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { toast } from 'sonner'

interface CreatePermitFormProps {
  setIsDialogOpen: (isOpen: boolean) => void
  onSuccess: () => void
  studentId?: string
}

const getTomorrowDate = (): Date => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow
}

export default function CreatePermitForm({
  setIsDialogOpen,
  onSuccess,
  studentId
}: CreatePermitFormProps) {
  const { user } = useAuth()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createPermit } = usePermitCreation()

  const form = useForm<PermitFormValues>({
    resolver: zodResolver(permitFormSchema),
    defaultValues: {
      studentId: studentId || '',
      amountPaid: '',
      expiryDate: getTomorrowDate()
    }
  })

  const onSubmit = async (values: PermitFormValues) => {
    if (!user?.id) {
      toast.error('You must be logged in to create a permit')
      return
    }

    setIsSubmitting(true)

    try {
      const res = await createPermit({
        ...values,
        amountPaid: Number.parseFloat(values.amountPaid),
        issuedById: user.id
      })
      console.log('Permit creation response:', res)

      if (!res.success) {
        toast.error(res.error || 'Failed to create permit')
        return
      }

      form.reset({
        studentId: '',
        amountPaid: '',
        expiryDate: getTomorrowDate()
      })

      setIsDialogOpen(false)
      onSuccess()
    } catch (error) {
      console.error('Error creating permit:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const hasErrors = Object.keys(form.formState.errors).length > 0

  return (
    <div className="space-y-6">
      {hasErrors && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>Please correct the errors below before submitting.</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter student ID"
                      disabled={!!studentId || isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    {studentId
                      ? 'Student ID is pre-filled'
                      : "Enter the student's unique ID number"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Paid (GHS) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      disabled={isSubmitting}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Enter the amount paid for the permit</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiry Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="w-4 h-4 ml-auto opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const today = new Date()
                          today.setHours(0, 0, 0, 0)
                          return date < today
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>Select when the permit will expire</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4 space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Permit'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
