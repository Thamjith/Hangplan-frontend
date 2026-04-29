import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Button, TextInput, Tile, Stack, Form, FormGroup } from '@carbon/react'
import { useCreateEventMutation } from '../store/hangplanApi'

const schema = z.object({
  title: z.string().min(1, 'Title required'),
  maxParticipants: z
    .string()
    .min(1, 'Required')
    .transform((s) => parseInt(s, 10))
    .refine((n) => !Number.isNaN(n) && n >= 1 && n <= 500, { message: '1–500' }),
})

type FormInput = z.input<typeof schema>
type FormOut = z.infer<typeof schema>

export function CreateEventPage() {
  const navigate = useNavigate()
  const [create, { isLoading }] = useCreateEventMutation()
  const { control, handleSubmit, formState } = useForm<FormInput, unknown, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', maxParticipants: '10' },
  })

  const onSubmit = async (data: FormOut) => {
    const ev = await create({
      title: data.title,
      maxParticipants: data.maxParticipants,
    }).unwrap()
    navigate(`/event/${ev.id}`, { replace: true })
  }

  return (
    <Stack gap={5}>
      <h1>Create an event</h1>
      <Tile>
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <Form>
            <FormGroup legendText="Event details">
              <Controller
                name="title"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="ev-title"
                    labelText="Title"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    {...field}
                  />
                )}
              />
              <div style={{ height: 12 }} />
              <Controller
                name="maxParticipants"
                control={control}
                render={({ field, fieldState }) => (
                  <TextInput
                    id="ev-max"
                    type="number"
                    min={1}
                    labelText="Max participants (including you)"
                    invalid={!!fieldState.error}
                    invalidText={fieldState.error?.message}
                    {...field}
                    onChange={(e) => field.onChange(e.target.value)}
                    value={String(field.value ?? '')}
                  />
                )}
              />
            </FormGroup>
          </Form>
          <div style={{ height: 20 }} />
          <Button type="submit" kind="primary" disabled={isLoading || formState.isSubmitting}>
            Create
          </Button>
        </form>
      </Tile>
    </Stack>
  )
}
