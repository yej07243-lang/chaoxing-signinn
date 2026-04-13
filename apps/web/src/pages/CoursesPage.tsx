import React from 'react';
import { EmptyState } from '../components/EmptyState';
import { SectionHeader } from '../components/SectionHeader';
import { SectionCard } from '../components/SectionCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAppState } from '../hooks/useAppState';

export const CoursesPage = () => {
  const { courses, activity } = useAppState();
  const activeCount = courses.filter((course) => course.hasTask).length;

  return (
    <div className='space-y-6'>
      <SectionHeader
        eyebrow='Courses'
        title='课程与任务视图'
        description='当前后端只直接返回待签到活动，所以这里把最近检测记录沉淀成课程视图，让工作区更像真正的产品列表页。'
      />

      <div className='grid gap-4 lg:grid-cols-3'>
        <div className='cx-kpi'>
          <p className='cx-pretitle'>总记录数</p>
          <p className='font-display mt-3 text-4xl font-semibold text-[color:var(--cx-text)]'>{courses.length}</p>
        </div>
        <div className='cx-kpi'>
          <p className='cx-pretitle'>进行中任务</p>
          <p className='font-display mt-3 text-4xl font-semibold text-[color:var(--cx-text)]'>{activeCount}</p>
        </div>
        <div className='cx-kpi'>
          <p className='cx-pretitle'>当前实时活动</p>
          <p className='mt-3 text-sm leading-6 text-[color:var(--cx-text)]'>{activity?.name || '暂无活动'}</p>
        </div>
      </div>

      <SectionCard title='课程列表'>
        {courses.length === 0 ? (
          <EmptyState title='还没有课程记录' description='登录后先到 Dashboard 刷新一次任务，课程卡片会随着检测结果逐步沉淀下来。' />
        ) : (
          <div className='grid gap-4 md:grid-cols-2'>
            {courses.map((course) => (
              <article key={course.id} className='rounded-[28px] border border-[color:var(--cx-border)] bg-white/70 p-5 transition hover:border-[color:var(--cx-text)]'>
                <div className='flex flex-col gap-4'>
                  <div>
                    <p className='font-display text-2xl font-semibold leading-7 text-[color:var(--cx-text)]'>{course.name}</p>
                    <p className='mt-2 text-sm text-[color:var(--cx-text-muted)]'>更新时间：{new Date(course.updatedAt).toLocaleString()}</p>
                  </div>

                  <div className='grid gap-3 rounded-[22px] bg-[color:var(--cx-bg-soft)]/90 p-4 sm:grid-cols-2'>
                    <div>
                      <p className='cx-pretitle'>签到任务</p>
                      <div className='mt-2'>
                        <StatusBadge tone={course.hasTask ? 'success' : 'neutral'}>
                          {course.hasTask ? '当前有签到任务' : '当前无签到任务'}
                        </StatusBadge>
                      </div>
                    </div>
                    <div>
                      <p className='cx-pretitle'>签到状态</p>
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
          <div className='rounded-[28px] bg-[color:var(--cx-dark)] px-5 py-6 text-white'>
            <p className='text-sm text-stone-300'>{activity.name}</p>
            <p className='mt-2 text-xs uppercase tracking-[0.25em] text-stone-500'>Ready Now</p>
          </div>
        </SectionCard>
      ) : null}
    </div>
  );
};
