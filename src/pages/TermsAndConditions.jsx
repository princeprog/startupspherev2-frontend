import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertCircle, Shield, Scale, Users } from "lucide-react";

export default function TermsAndConditions() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto w-full px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md px-3 py-1"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-3 ml-2">
              <div className="rounded-full w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-700">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Terms and Conditions</h1>
                <p className="text-xs text-gray-500">Capstone Project | Last Updated: December 1, 2025</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-12 lg:py-20">
        {/* Important Notice */}
        <div className="mb-8 rounded-lg border border-yellow-100 bg-yellow-400 shadow-sm p-5 flex items-start gap-4">
          <div className="text-amber-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Academic Capstone Project Notice</h3>
            <p className="text-sm text-gray-700 mt-1">
              <strong>StartupSphere is a capstone project developed for educational purposes.</strong> This platform
              serves as a demonstration of web development capabilities and is not a commercial service. By using this
              platform, you acknowledge its academic nature. Data submitted may be used solely for project evaluation
              and demonstration purposes.
            </p>
          </div>
        </div>

        {/* Main Layout */}
        <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
          {/* Side Overview */}
          <aside className="space-y-4">
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <h2 className="text-sm font-semibold text-gray-900 mb-2">Summary</h2>
              <p className="text-xs text-gray-600">
                These Terms and Conditions explain how this academic platform should be used. They outline your
                responsibilities as a user and the limitations of this capstone project.
              </p>
            </div>
            <div className="bg-white border border-gray-100 rounded-xl shadow-sm p-4">
              <h3 className="text-xs font-semibold text-gray-800 uppercase tracking-wide mb-3">
                Quick Navigation
              </h3>
              <ol className="space-y-2 text-xs text-gray-700">
                <li>1. Acceptance of Terms</li>
                <li>2. User Accounts & Registration</li>
                <li>3. Startup Information & Data</li>
                <li>4. Intellectual Property Rights</li>
                <li>5. Prohibited Activities</li>
                <li>6. Limitation of Liability</li>
                <li>7. Privacy & Data Protection</li>
                <li>8. Governing Law & Disputes</li>
                <li>9. Contact Information</li>
                <li>10. Miscellaneous</li>
              </ol>
            </div>
            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-4 flex items-start gap-3">
              <Shield className="h-5 w-5 text-blue-400 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-800">Educational Use Only</p>
                <p className="text-[11px] text-gray-600 mt-1">
                  StartupSphere is created for academic demonstration. Please use test or sample data and avoid
                  submitting sensitive information.
                </p>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="p-6 lg:p-10 space-y-8">
              {/* Section 1 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <span>Acceptance of Terms</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p>
                      <strong>StartupSphere is an academic capstone project</strong> created for educational and
                      demonstration purposes. By creating an account, you acknowledge that this is not a commercial
                      platform and any data you provide is for academic evaluation only. You understand that this
                      platform is a student project and not intended for actual business operations.
                    </p>
                    <p>
                      As this is a capstone project, terms may be updated as the project evolves. The platform is
                      provided for educational demonstration and is not intended to replace professional startup
                      management or business services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <span>User Accounts and Registration</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p className="font-medium text-gray-900">Account Creation (Academic Project)</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Accounts are created solely for testing and demonstrating the capstone project.</li>
                      <li>You understand this is not a real commercial service.</li>
                      <li>Information provided should be for demonstration purposes only.</li>
                      <li>You are responsible for your account credentials during the project evaluation period.</li>
                      <li>Accounts may be removed after the capstone project completion.</li>
                    </ul>
                    <p className="font-medium text-gray-900 mt-4">Project Duration</p>
                    <p>
                      As this is a capstone project, the platform is available during the academic period and may be
                      discontinued after project evaluation. Accounts and data may be removed or archived after the
                      project concludes.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" defaultChecked />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                    <Shield className="h-4 w-4" />
                  </div>
                  <span>Startup Information and Data</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p className="font-medium text-gray-900">Academic Demonstration Data</p>
                    <p>
                      This platform is designed to demonstrate startup data management capabilities. Users may input
                      sample or real startup information for demonstration purposes:
                    </p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Company information is used solely for project demonstration.</li>
                      <li>Data entered is for academic evaluation and testing.</li>
                      <li>No business transactions or actual services are provided.</li>
                      <li>Information shared is visible to project evaluators and testers.</li>
                      <li>Data may be used in project presentations and documentation.</li>
                    </ul>
                    <p className="font-medium text-gray-900 mt-4">No Legal or Business Services</p>
                    <p>
                      This capstone project does not provide legal verification, business registration, or professional
                      services. Features demonstrating government registration integration (DTI, DOST, DICT) are for
                      educational purposes only and do not constitute actual registration or verification services.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <span>Intellectual Property Rights</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p className="font-medium text-gray-900">Academic Project Ownership</p>
                    <p>
                      StartupSphere is a capstone project created for educational purposes. The platform code, design,
                      and features are part of an academic submission. Content and demonstrations are used solely for
                      educational evaluation.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">Demonstration Content</p>
                    <p>
                      By uploading content to this academic platform, you understand it may be used in project
                      presentations, documentation, and demonstrations for educational purposes. You retain ownership of
                      your content, and it will be used only within the scope of this capstone project evaluation.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">Restrictions</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>
                        You may not reproduce, distribute, or create derivative works from our platform content without
                        permission.
                      </li>
                      <li>You may not use our trademarks, logos, or branding without written consent.</li>
                      <li>You may not reverse engineer or attempt to extract source code from our platform.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    5
                  </div>
                  <span>Prohibited Activities</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p>Users are strictly prohibited from:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4">
                      <li>Posting false, misleading, or fraudulent information about startups.</li>
                      <li>Impersonating another person or entity.</li>
                      <li>Uploading malicious code, viruses, or harmful software.</li>
                      <li>Attempting to gain unauthorized access to the platform or other users&apos; accounts.</li>
                      <li>Harassing, threatening, or abusing other users.</li>
                      <li>Scraping or collecting data from the platform without permission.</li>
                      <li>Using the platform for illegal activities or purposes.</li>
                      <li>Spamming or sending unsolicited commercial communications.</li>
                      <li>Violating any applicable local, national, or international laws.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Section 6 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center">
                    <Scale className="h-4 w-4" />
                  </div>
                  <span>Limitation of Liability</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p className="font-medium text-gray-900">Academic Project Status</p>
                    <p>
                      <strong>This is a student capstone project, not a commercial service.</strong> The platform is
                      provided for educational demonstration only, without any warranties. As an academic project, it
                      may have bugs, limitations, or downtime. It is not intended for actual business use or critical
                      operations.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">No Professional Services</p>
                    <p>
                      This platform does not provide professional business services, legal advice, or commercial
                      support. Information displayed is for demonstration purposes. Do not make business decisions
                      based on this academic project.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">Educational Purpose Only</p>
                    <p>
                      This capstone project is created for academic evaluation. No liability is assumed for any use
                      beyond educational demonstration. The platform is not responsible for any outcomes related to
                      information shared on this academic project.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    7
                  </div>
                  <span>Privacy and Data Protection</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p>
                      As an academic capstone project, data collected is used solely for educational purposes and
                      project evaluation. Our Privacy Policy describes how demonstration data is handled. By using this
                      platform, you understand your data is part of an academic project.
                    </p>
                    <p>
                      While we implement basic security measures appropriate for a student project, this is not a
                      commercial platform with enterprise-level security. Do not submit sensitive or confidential
                      business information.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 8 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    8
                  </div>
                  <span>Governing Law and Dispute Resolution</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p>
                      These Terms and Conditions shall be governed by and construed in accordance with the laws of the
                      Republic of the Philippines. Any disputes arising from or relating to these terms shall be subject
                      to the exclusive jurisdiction of the courts of the Philippines.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">Dispute Resolution</p>
                    <p>
                      In the event of any dispute, controversy, or claim arising from these terms, the parties agree to
                      first attempt to resolve the matter through good faith negotiation. If resolution cannot be
                      reached within 30 days, the matter may be submitted to mediation or arbitration before resorting
                      to litigation.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 9 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    9
                  </div>
                  <span>Contact Information</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p>
                      If you have any questions, concerns, or complaints regarding these Terms and Conditions, please
                      contact us at:
                    </p>
                    <div className="stats stats-vertical lg:stats-horizontal shadow mt-4 bg-gray-50 border border-gray-100 not-prose">
                      <div className="stat">
                        <div className="stat-figure text-secondary">
                          <Shield className="h-8 w-8" />
                        </div>
                        <div className="stat-title text-xs">Capstone Project Contact</div>
                        <div className="stat-value text-sm">Project Team</div>
                        <div className="stat-desc">Academic project - for evaluation purposes</div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 10 */}
              <section className="collapse collapse-arrow bg-white rounded-md border border-blue-50">
                <input type="checkbox" />
                <div className="collapse-title text-lg font-semibold flex items-center gap-3 text-gray-800">
                  <div className="bg-blue-50 text-blue-400 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    10
                  </div>
                  <span>Miscellaneous</span>
                </div>
                <div className="collapse-content">
                  <div className="prose max-w-none pt-4 text-gray-800">
                    <p className="font-medium text-gray-900">Severability</p>
                    <p>
                      If any provision of these Terms and Conditions is found to be invalid or unenforceable, the
                      remaining provisions shall continue in full force and effect.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">Entire Agreement</p>
                    <p>
                      These Terms and Conditions, together with the Privacy Policy, constitute the entire agreement
                      between you and StartupSphere regarding your use of the platform.
                    </p>
                    <p className="font-medium text-gray-900 mt-4">No Waiver</p>
                    <p>
                      Our failure to enforce any right or provision of these terms shall not be deemed a waiver of such
                      right or provision.
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Agreement Footer */}
        <div className="mt-8 rounded-lg border border-blue-50 bg-white p-5 shadow-sm flex items-start gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            className="stroke-blue-400 flex-shrink-0 w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <div>
            <p className="font-semibold text-gray-800">Academic Capstone Project Disclaimer</p>
            <p className="text-sm text-gray-600">
              By using StartupSphere, you acknowledge this is a student capstone project for educational purposes only.
              This is not a commercial platform or professional service. Data submitted is for academic evaluation and
              demonstration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
