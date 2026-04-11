import React from 'react';
import { QrImageSignCard } from '../components/QrImageSignCard';
import { SectionCard } from '../components/SectionCard';
import { SignActionPanel } from '../components/SignActionPanel';
import { useAppState } from '../hooks/useAppState';

export const SignPage = () => {
  const { activity, activityState } = useAppState();
  const hasTask = activityState === 'ready' && !!activity?.activeId;

  return (
    <div className='space-y-6'>
      <div>
        <p className='text-sm font-medium uppercase tracking-[0.25em] text-slate-400'>Sign</p>
        <h1 className='mt-3 text-3xl font-semibold text-slate-950'>签到</h1>
        <p className='mt-3 max-w-2xl text-sm leading-6 text-slate-500'>
          将所有可选签到方式集中到一个页面：当前活动签到、拍照签到、位置签到、签到码签到，以及二维码图片签到。
        </p>
      </div>

      <SectionCard
        title='当前活动签到'
        description={hasTask ? '检测到可签到活动，可在这里选择合适的签到方式完成提交。' : '当前没有检测到可签到活动，你仍然可以使用二维码图片签到。'}
      >
        <SignActionPanel />
      </SectionCard>

      <SectionCard title='二维码图片签到' description='上传二维码图片后直接识别并签到，不会阻塞当前主流程。'>
        <QrImageSignCard />
      </SectionCard>
    </div>
  );
};
