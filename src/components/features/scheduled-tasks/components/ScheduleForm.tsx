import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../../../ui/dialog';
import { Button } from '../../../ui/button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../ui/select';
import type { ScheduledTask, RecurrenceType } from '../types';
import { RECURRENCE_OPTIONS, WEEKDAY_OPTIONS } from '../scheduledTasksData';

interface ScheduleFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: ScheduledTask | null;
  onSave: (data: {
    name: string;
    instructions: string;
    recurrence: RecurrenceType;
    scheduledTime: string;
    scheduledDay?: number;
  }) => void;
}

export function ScheduleForm({ open, onOpenChange, task, onSave }: ScheduleFormProps) {
  const [name, setName] = useState('');
  const [instructions, setInstructions] = useState('');
  const [recurrence, setRecurrence] = useState<RecurrenceType>('daily');
  const [scheduledTime, setScheduledTime] = useState('09:00');
  const [scheduledDay, setScheduledDay] = useState<number>(1);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setInstructions(task.instructions);
      setRecurrence(task.recurrence);
      setScheduledTime(task.scheduledTime);
      setScheduledDay(task.scheduledDay ?? 1);
    } else {
      setName('');
      setInstructions('');
      setRecurrence('daily');
      setScheduledTime('09:00');
      setScheduledDay(1);
    }
  }, [task, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      instructions,
      recurrence,
      scheduledTime,
      scheduledDay: recurrence === 'weekly' || recurrence === 'monthly' ? scheduledDay : undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? '예약 작업 편집' : '새 예약 작업'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-500 uppercase">작업명</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="주간 매출 리포트 생성"
              required
              data-testid="schedule-form-name"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-bold text-gray-500 uppercase">지시사항</Label>
            <textarea
              value={instructions}
              onChange={e => setInstructions(e.target.value)}
              placeholder="에이전트에게 전달할 작업 지시사항을 입력하세요."
              required
              rows={3}
              className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent resize-none"
              data-testid="schedule-form-instructions"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">빈도</Label>
              <Select value={recurrence} onValueChange={(v) => setRecurrence(v as RecurrenceType)}>
                <SelectTrigger data-testid="schedule-form-recurrence">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">실행 시간</Label>
              <Input
                type="time"
                value={scheduledTime}
                onChange={e => setScheduledTime(e.target.value)}
                data-testid="schedule-form-time"
              />
            </div>
          </div>

          {recurrence === 'weekly' && (
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">요일</Label>
              <Select value={String(scheduledDay)} onValueChange={(v) => setScheduledDay(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WEEKDAY_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={String(opt.value)}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {recurrence === 'monthly' && (
            <div className="space-y-1">
              <Label className="text-xs font-bold text-gray-500 uppercase">날짜</Label>
              <Input
                type="number"
                min={1}
                max={31}
                value={scheduledDay}
                onChange={e => setScheduledDay(Number(e.target.value))}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              취소
            </Button>
            <Button type="submit" className="bg-[#1A1A1A] hover:bg-black text-white">
              {task ? '저장' : '생성'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
