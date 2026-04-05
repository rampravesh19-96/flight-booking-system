'use client';

interface BookingStatusTimelineProps {
  status: string;
  createdAt: string;
  cancelledAt?: string;
}

interface StatusStep {
  key: string;
  label: string;
  description: string;
  completed: boolean;
  timestamp?: string;
}

export default function BookingStatusTimeline({ status, createdAt, cancelledAt }: BookingStatusTimelineProps) {
  const getStatusSteps = (): StatusStep[] => {
    const steps: StatusStep[] = [
      {
        key: 'initiated',
        label: 'Booking Initiated',
        description: 'Booking request received',
        completed: true,
        timestamp: createdAt,
      },
      {
        key: 'payment_pending',
        label: 'Payment Pending',
        description: 'Waiting for payment completion',
        completed: ['payment_pending', 'payment_verified', 'confirmed', 'cancelled'].includes(status),
        timestamp: status === 'payment_pending' ? new Date().toISOString() : undefined,
      },
      {
        key: 'payment_verified',
        label: 'Payment Verified',
        description: 'Payment successfully processed',
        completed: ['payment_verified', 'confirmed', 'cancelled'].includes(status),
        timestamp: status === 'payment_verified' ? new Date().toISOString() : undefined,
      },
      {
        key: 'confirmed',
        label: 'Booking Confirmed',
        description: 'Flight booking confirmed',
        completed: status === 'confirmed',
        timestamp: status === 'confirmed' ? new Date().toISOString() : undefined,
      },
    ];

    // Add cancelled step if booking was cancelled
    if (status === 'cancelled') {
      steps.push({
        key: 'cancelled',
        label: 'Booking Cancelled',
        description: 'Booking has been cancelled',
        completed: true,
        timestamp: cancelledAt,
      });
    }

    return steps;
  };

  const steps = getStatusSteps();
  const currentStepIndex = steps.findIndex(step => step.key === status);

  return (
    <div className="py-4">
      <h3 className="text-lg font-semibold mb-6 text-center">Booking Status</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-600"></div>

        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.key} className="relative flex items-start">
              {/* Timeline dot */}
              <div
                className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 ${
                  step.completed
                    ? step.key === 'cancelled'
                      ? 'border-red-500 bg-red-900/30'
                      : 'border-cyan-500 bg-cyan-900/30'
                    : 'border-slate-600 bg-slate-800'
                }`}
              >
                {step.completed ? (
                  step.key === 'cancelled' ? (
                    <svg className="h-6 w-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )
                ) : (
                  <div className="h-3 w-3 rounded-full bg-slate-500"></div>
                )}
              </div>

              {/* Content */}
              <div className="ml-6 flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={`font-semibold ${
                    step.completed
                      ? step.key === 'cancelled'
                        ? 'text-red-400'
                        : 'text-cyan-400'
                      : 'text-slate-400'
                  }`}>
                    {step.label}
                  </h4>
                  {step.timestamp && (
                    <span className="text-xs text-slate-500">
                      {new Date(step.timestamp).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-400">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}