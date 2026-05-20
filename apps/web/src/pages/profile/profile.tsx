/**
 * 个人中心 / 团队空间管理页面
 *
 * 功能说明：
 * - 顶部展示当前所在空间和用户角色
 * - 空间下拉切换，调用 useUserStore 全局同步
 * - 团队成员列表动态加载（调用 getTeamMembers API）
 * - "+ 邀请成员" 按钮弹出输入框，调用 inviteMember API
 * - 底部退出登录
 */

import { useState, useEffect } from 'react'
import { Button, Select, Tag, Card, message, Modal, Input as AntInput } from 'antd'
import { useNavigate } from 'react-router-dom'
import { LogoutOutlined, UserAddOutlined } from '@ant-design/icons'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { getTeamMembers, inviteMember } from '@/api/team'
import type { TeamMemberData } from '@/api/team'
import styles from './profile.module.css'

const Profile = () => {
  const navigate = useNavigate()
  const currentSpaceId = useUserStore((state) => state.currentSpaceId)
  const setCurrentSpaceId = useUserStore((state) => state.setCurrentSpaceId)
  const logout = useAuthStore((state) => state.logout)

  const [members, setMembers] = useState<TeamMemberData[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviting, setInviting] = useState(false)

  /** 加载团队成员列表 */
  const loadMembers = async () => {
    setLoadingMembers(true)
    try {
      const res = await getTeamMembers(currentSpaceId)
      if (res.success) {
        setMembers(res.data)
      }
    } catch {
      message.error('加载团队成员失败')
    } finally {
      setLoadingMembers(false)
    }
  }

  useEffect(() => {
    loadMembers()
  }, [currentSpaceId])

  /** 退出登录 */
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  /** 发送邀请 */
  const handleInvite = async () => {
    if (!inviteEmail.trim()) {
      message.warning('请输入邮箱地址')
      return
    }
    setInviting(true)
    try {
      const res = await inviteMember({ email: inviteEmail.trim(), spaceId: currentSpaceId, roleType: 'member' })
      if (res.success) {
        message.success('邀请已发送')
        setInviteModalOpen(false)
        setInviteEmail('')
        loadMembers()
      }
    } catch {
      message.error('邀请发送失败，请稍后重试')
    } finally {
      setInviting(false)
    }
  }

  /** 当前角色标签 */
  const roleTag = currentSpaceId === 'personal'
    ? { text: '个人用户', color: 'blue' as const }
    : { text: '项目组成员 (读写部分受限)', color: 'geekblue' as const }

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>

        {/* 顶部信息区 */}
        <div className={styles.headerSection}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>当前所在空间</span>
            <Select
              value={currentSpaceId}
              onChange={(val) => setCurrentSpaceId(val)}
              className={styles.spaceSelect}
              options={[
                { value: 'ruixing', label: '瑞幸项目组' },
                { value: 'personal', label: '个人独立空间' },
              ]}
            />
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>我的角色</span>
            <Tag color={roleTag.color}>{roleTag.text}</Tag>
          </div>
        </div>

        {/* 团队成员列表区 */}
        <div className={styles.memberSection}>
          <div className={styles.memberHeader}>
            <h2 className={styles.memberTitle}>团队成员列表</h2>
            <Button
              type="primary"
              icon={<UserAddOutlined />}
              onClick={() => setInviteModalOpen(true)}
              disabled={currentSpaceId === 'personal'}
            >
              邀请成员
            </Button>
          </div>

          <div className={styles.memberList}>
            {loadingMembers ? (
              <div className={styles.loadingText}>加载中...</div>
            ) : members.length === 0 ? (
              <div className={styles.loadingText}>暂无团队成员</div>
            ) : (
              members.map((member) => {
              /* 取姓名首字作为头像文字 */
              const avatarChar = member.name.charAt(0)
              /* 管理员用紫色，普通成员用绿色 */
              const avatarColor = member.roleType === 'admin' ? '#7c3aed' : '#34a853'

              return (
                <Card key={member.id} className={styles.memberCard} size="small">
                  <div className={styles.memberItem}>
                    <div
                      className={styles.avatar}
                      style={{ backgroundColor: avatarColor }}
                    >
                      {avatarChar}
                    </div>
                    <span className={styles.memberName}>
                      {member.name}
                      {member.isSelf && <span className={styles.selfTag}>（我）</span>}
                    </span>
                    <Tag
                      color={member.roleType === 'admin' ? 'gold' : 'default'}
                    >
                      {member.role}
                    </Tag>
                  </div>
                </Card>
              )
            })
            )}
          </div>
        </div>

        {/* 退出登录 */}
        <div className={styles.footerSection}>
          <Button
            danger
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            退出登录
          </Button>
        </div>

      </div>

      {/* 邀请成员弹窗 */}
      <Modal
        title="邀请成员"
        open={inviteModalOpen}
        onCancel={() => { setInviteModalOpen(false); setInviteEmail('') }}
        onOk={handleInvite}
        confirmLoading={inviting}
        okText="发送邀请"
        cancelText="取消"
      >
        <AntInput
          placeholder="请输入成员邮箱"
          value={inviteEmail}
          onChange={(e) => setInviteEmail(e.target.value)}
          onPressEnter={handleInvite}
        />
      </Modal>
    </div>
  )
}

export default Profile