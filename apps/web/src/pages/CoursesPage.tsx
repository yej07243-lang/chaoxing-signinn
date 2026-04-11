import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppState } from '../hooks/useAppState';

export const CoursesPage = () => {
  const { courses, activity } = useAppState();

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Courses</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-950'>课程 / 签到列表</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>
          现有后端接口只直接暴露当前待签到活动，所以这个页面会汇总当前任务和最近签到记录，形成更清晰的课程视图。
        </p>
      </div>

      <SectionCard title='课程列表'>
        {courses.length === 0 ? (
          <EmptyState title='还没有课程记录' description='登录后先到 Dashboard 刷新一次任务，课程卡片会随着检测结果逐步沉淀下来。' />
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {courses.map((course) => (
              <article key={course.id} className='rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/90 p-5 transition hover:border-slate-300'>
                <div className='flex flex-col gap-4'>
                  <div>
                    <p className='text-lg font-semibold leading-7 text-slate-950'>{course.name}</p>
                    <p className='mt-2 text-sm text-slate-500'>更新时间：{new Date(course.updatedAt).toLocaleString()}</p>
                  </div>

                  <div className='grid gap-3 rounded-2xl bg-white/80 p-4 sm:grid-cols-2'>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>签到任务</p>
                      <div className='mt-2'>
                        <StatusBadge tone={course.hasTask ? 'success' : 'neutral'}>
                          {course.hasTask ? '当前有签到任务' : '当前无签到任务'}
                        </StatusBadge>
                      </div>
                    </div>
                    <div>
                      <p className='text-xs uppercase tracking-[0.2em] text-slate-400'>签到状态</p>
                      <div className='mt-2'>
                        <StatusBadge tone={course.status === '已签到' ? 'success' : course.status === '未签到' ? 'warning' : 'neutral'}>
                          {course.status}
                        </StatusBadge>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>

      {activity ? (
        <SectionCard title='当前检测到的任务'>
          <div className='rounded-3xl bg-slate-950 px-5 py-6 text-white'>
            <p className='text-sm text-slate-300'>{activity.name}</p>
            <p className='mt-2 text-xs uppercase tracking-[0.25em] text-slate-500'>Ready Now</p>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
};
