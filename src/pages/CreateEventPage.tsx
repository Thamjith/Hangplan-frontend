import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { MyEventsPanel } from '../components/MyEventsPanel'
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOut>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', maxParticipants: '10' },
  })

  const onSubmit = async (data: FormOut) => {
    const ev = await create({ title: data.title, maxParticipants: data.maxParticipants }).unwrap()
    navigate(`/event/${ev.id}`, { replace: true })
  }

  const busy = isLoading || isSubmitting

  return (
    <div>
      <MyEventsPanel />
      <h1 className="hp-page-title">Create an event</h1>
      <div className="hp-card" style={{ maxWidth: 480 }}>
        <form onSubmit={handleSubmit(onSubmit)} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="hp-input-group">
            <label htmlFor="ev-title">Title</label>
            <input
              id="ev-title"
              className={`hp-input${errors.title ? ' is-error' : ''}`}
              placeholder="Beach trip, Movie night…"
              {...register('title')}
            />
            {errors.title && <span className="hp-field-error">{errors.title.message}</span>}
          </div>
          <div className="hp-input-group">
            <label htmlFor="ev-max">Max participants (including you)</label>
            <input
              id="ev-max"
              type="number"
              min={1}
              max={500}
              className={`hp-input${errors.maxParticipants ? ' is-error' : ''}`}
              {...register('maxParticipants')}
            />
            {errors.maxParticipants && <span className="hp-field-error">{errors.maxParticipants.message}</span>}
          </div>
          <div>
            <button type="submit" className="hp-btn hp-btn--primary" disabled={busy}>
              {busy ? <span className="hp-spinner" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
