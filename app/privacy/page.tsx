import type { Metadata } from "next";
import AuthGuard from '@/lib/components/AuthGuard';
import styles from './privacy.module.css';

export const metadata: Metadata = {
  title: "隐私权政策 - Mark Clipper",
  description: "Mark Clipper应用和扩展的隐私权政策，了解我们如何收集、使用和保护您的数据",
};

export default function PrivacyPage() {
  return (
    <AuthGuard requireAuth={false}>
      <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>隐私权政策</h1>
        <p className={styles.lastUpdated}>最后更新：2024年12月19日</p>
      </div>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. 概述</h2>
          <p className={styles.paragraph}>
            Mark Clipper（"我们"、"本应用"）尊重您的隐私权。本隐私权政策说明了我们如何收集、使用、存储和保护您在使用Mark Clipper网页应用和浏览器扩展时的个人信息。
          </p>
          <p className={styles.paragraph}>
            Mark Clipper是一个网页内容标记和管理工具，帮助用户收集、整理和管理来自各个网站的有价值内容。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. 我们收集的信息</h2>
          
          <h3 className={styles.subsectionTitle}>2.1 用户账户信息</h3>
          <ul className={styles.list}>
            <li>电子邮箱地址（用于账户创建和身份验证）</li>
            <li>用户名或显示名称</li>
            <li>头像信息（如果您选择设置）</li>
            <li>账户创建和最后登录时间</li>
          </ul>

          <h3 className={styles.subsectionTitle}>2.2 内容数据</h3>
          <ul className={styles.list}>
            <li>您选择保存的网页文本内容</li>
            <li>保存内容的来源网页URL和标题</li>
            <li>您创建的分类和标签</li>
            <li>内容保存的时间戳</li>
            <li>您对内容的编辑和注释</li>
          </ul>

          <h3 className={styles.subsectionTitle}>2.3 技术信息</h3>
          <ul className={styles.list}>
            <li>浏览器类型和版本</li>
            <li>操作系统信息</li>
            <li>IP地址（仅用于安全目的）</li>
            <li>访问时间和使用模式</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. 信息使用方式</h2>
          <p className={styles.paragraph}>我们使用收集的信息来：</p>
          <ul className={styles.list}>
            <li><strong>提供核心服务：</strong>保存、同步和管理您的标记内容</li>
            <li><strong>用户认证：</strong>验证您的身份并维护登录状态</li>
            <li><strong>数据同步：</strong>在您的不同设备间同步内容和设置</li>
            <li><strong>服务改进：</strong>分析使用模式以改善用户体验</li>
            <li><strong>安全保护：</strong>检测和防止滥用、欺诈或安全威胁</li>
            <li><strong>技术支持：</strong>为您提供客户服务和技术支持</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. 信息分享</h2>
          <p className={styles.paragraph}>我们会在以下有限情况下分享您的信息：</p>
          
          <h3 className={styles.subsectionTitle}>4.1 服务提供商</h3>
          <ul className={styles.list}>
            <li><strong>Supabase：</strong>我们的主要后端服务提供商，用于数据存储、用户认证和数据库管理</li>
            <li><strong>Vercel：</strong>我们的应用托管服务提供商</li>
            <li><strong>身份验证提供商：</strong>如Google、GitHub等OAuth服务（如果您选择使用社交登录）</li>
          </ul>

          <h3 className={styles.subsectionTitle}>4.2 法律要求</h3>
          <p className={styles.paragraph}>
            在法律要求、政府要求或为保护我们的权利和安全时，我们可能需要披露您的信息。
          </p>

          <h3 className={styles.subsectionTitle}>4.3 我们不会做的事</h3>
          <ul className={styles.list}>
            <li>向第三方出售您的个人信息</li>
            <li>将您的内容用于广告目的</li>
            <li>与未经授权的第三方分享您的标记内容</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. 数据安全</h2>
          <p className={styles.paragraph}>我们采取多种安全措施保护您的信息：</p>
          <ul className={styles.list}>
            <li><strong>加密传输：</strong>所有数据传输均使用HTTPS加密</li>
            <li><strong>数据库安全：</strong>数据存储在安全的云数据库中，采用行级安全策略</li>
            <li><strong>访问控制：</strong>实施严格的访问控制和权限管理</li>
            <li><strong>定期审计：</strong>定期进行安全审查和漏洞评估</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. 数据保留</h2>
          <p className={styles.paragraph}>
            我们仅在必要时保留您的信息：
          </p>
          <ul className={styles.list}>
            <li><strong>账户信息：</strong>在您的账户激活期间保留</li>
            <li><strong>内容数据：</strong>直到您删除或账户被删除</li>
            <li><strong>日志数据：</strong>通常保留30-90天用于安全和诊断目的</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. 您的权利</h2>
          <p className={styles.paragraph}>您对自己的数据拥有以下权利：</p>
          <ul className={styles.list}>
            <li><strong>访问权：</strong>查看我们存储的关于您的信息</li>
            <li><strong>更正权：</strong>要求更正不准确的信息</li>
            <li><strong>删除权：</strong>要求删除您的个人信息</li>
            <li><strong>数据可携权：</strong>要求导出您的数据</li>
            <li><strong>撤回同意：</strong>随时撤回您的同意</li>
          </ul>
          <p className={styles.paragraph}>
            要行使这些权利，请通过应用内设置或联系我们的支持团队。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. Chrome扩展特别说明</h2>
          <p className={styles.paragraph}>我们的Chrome扩展：</p>
          <ul className={styles.list}>
            <li><strong>仅在您主动选择文本时</strong>获取网页内容</li>
            <li><strong>不会读取</strong>您未明确选择的网页内容</li>
            <li><strong>不会跟踪</strong>您的浏览历史</li>
            <li><strong>不会注入广告</strong>或修改网页内容</li>
            <li><strong>本地存储</strong>仅用于缓存认证信息和用户设置</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. 第三方服务</h2>
          <p className={styles.paragraph}>
            我们的应用集成了以下第三方服务，它们有自己的隐私政策：
          </p>
          <ul className={styles.list}>
            <li><strong>Supabase：</strong> <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className={styles.link}>https://supabase.com/privacy</a></li>
            <li><strong>Vercel：</strong> <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.link}>https://vercel.com/legal/privacy-policy</a></li>
            <li><strong>Google（如使用OAuth）：</strong> <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className={styles.link}>https://policies.google.com/privacy</a></li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. 儿童隐私</h2>
          <p className={styles.paragraph}>
            我们的服务不面向13岁以下的儿童。我们不会故意收集13岁以下儿童的个人信息。如果我们发现收集了儿童的个人信息，我们会立即删除这些信息。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. 跨境数据传输</h2>
          <p className={styles.paragraph}>
            您的信息可能会被传输到您所在国家/地区以外的服务器进行处理和存储。我们确保这些传输符合适用的数据保护法律，并采取适当的安全措施。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>12. 政策更新</h2>
          <p className={styles.paragraph}>
            我们可能会定期更新此隐私权政策。重大更改时，我们会通过应用内通知或电子邮件通知您。继续使用我们的服务即表示您接受更新后的政策。
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>13. 联系我们</h2>
          <p className={styles.paragraph}>
            如果您对此隐私权政策有任何疑问或担忧，或者想要行使您的数据权利，请联系我们：
          </p>
          <div className={styles.contactInfo}>
            <p><strong>电子邮件：</strong> privacy@mark-clipper.com</p>
            <p><strong>应用内反馈：</strong> 通过应用设置中的"反馈"功能</p>
          </div>
        </section>

        <div className={styles.footer}>
          <p className={styles.footerText}>
            本隐私权政策的制定符合《通用数据保护条例》(GDPR)、《加州消费者隐私法》(CCPA)和其他适用的数据保护法律的要求。
          </p>
          <p className={styles.footerText}>
            Mark Clipper - 让网页内容管理更简单、更安全。
          </p>
        </div>
      </div>
    </div>
    </AuthGuard>
  );
}