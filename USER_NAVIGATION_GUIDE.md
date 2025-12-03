# StartupSphere v2 - User Navigation Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Main Navigation](#main-navigation)
3. [Adding Startups](#adding-startups)
4. [Adding Stakeholders](#adding-stakeholders)
5. [Managing Your Dashboard](#managing-your-dashboard)
6. [Additional Features](#additional-features)

---

## Getting Started

### First Time Login
1. Open the application in your web browser
2. You'll see the main 3D map interface
3. Click the **Login** button in the sidebar to access your account
4. If you don't have an account, click **Sign Up** to create one
5. After registration, verify your email address through the verification modal

### Account Verification
- Check your email for a verification code
- Enter the code in the verification modal
- Once verified, you can access all features

---

## Main Navigation

### Sidebar Menu
The sidebar on the left contains all main navigation options:

- **🌐 Map View** - Interactive 3D map of all startups
- **📊 Dashboard** - Your startup dashboard (requires login)
- **🔔 Notifications** - View notifications about your startups
- **📖 Bookmarks** - View bookmarked startups
- **🏆 All Startups** - Browse all startups in the database
- **👤 Profile** - Manage your account settings

### Top Navigation
- Search bar for finding specific startups
- Filter options by industry, location, or funding stage
- User profile icon for quick access to settings

---

## Adding Startups

### Step 1: Access the Add Startup Feature

#### From Your Dashboard:
1. Login to your account
2. Navigate to **Startup Dashboard** from the sidebar
3. Click the **"Add Startup"** or **"+"** button
4. A modal will appear with two options:
   - **Manual Input** - Fill out forms step-by-step
   - **CSV Upload** - Upload multiple startups at once

### Step 2: Choose Your Input Method

#### Option A: Manual Input

**Tab 1: Company Information**
1. **Company Name** *(required)* - Enter your startup's official name
2. **Company Description** - Brief overview of your startup (max 500 characters)
3. **Founded Date** - Select the date your company was established
4. **Type of Company** - Choose from:
   - Sole Proprietorship
   - Partnership
   - Corporation
   - LLC
5. **Number of Employees** - Select employee range
6. **Industry** - Select primary industry sector

**Tab 2: Contact Information**
1. **Phone Number** *(required)* - Main contact number
2. **Contact Email** *(required)* - Official business email
3. **Website** - Company website URL (if available)

**Tab 3: Address Information**
1. **Region** - Select your region (dropdown will populate)
2. **Province** - Select province (based on region)
3. **City** - Select city (based on province)
4. **Barangay** - Select barangay (based on city)
5. **Street Address** - Detailed street address
6. **Postal Code** - ZIP/Postal code

**Tab 4: Social Media Links** *(Optional)*
- Facebook Page URL
- Twitter/X Handle
- Instagram Profile
- LinkedIn Company Page

**Tab 5: Additional Information**
1. **Funding Stage** - Select current stage:
   - Pre-seed
   - Seed
   - Series A/B/C
   - Growth
   - Mature
2. **Operating Hours** - Business hours
3. **Business Activity** - Primary business activities
4. **Government Registration Status** - Yes/No
   - If Yes, provide:
     - Registration Agency (DTI, SEC, CDA, etc.)
     - Registration Number
     - Registration Date
     - Business License Number
     - TIN (Tax Identification Number)

**Tab 6: Location Info**
1. An interactive **Mapbox map** will appear
2. Use the **search bar** on the map to find your location
3. Or **click directly** on the map to drop a pin
4. The system will automatically capture:
   - Latitude
   - Longitude
   - Address details
5. Verify the marker is in the correct position

**Tab 7: Upload Data** *(Optional)*
1. **Company Logo** - Upload your startup logo (PNG, JPG, max 5MB)
2. **Registration Certificate** - Upload government registration documents (PDF)
3. Review privacy and security information
4. Click **"View Privacy & Security"** to understand data protection

### Step 3: Submit Your Startup
1. Review all information across tabs
2. You have two options:
   - **Save as Draft** - Save progress and complete later
   - **Submit for Verification** - Submit for admin review
3. After submission:
   - You'll receive a confirmation message
   - Check your email for verification code
   - Enter the code to complete registration
4. Your startup will appear in your dashboard with a "Pending" status

#### Option B: CSV Upload

**Preparing Your CSV File:**
1. Download the **template CSV file** from the upload page
2. Fill in your startup data following the template format
3. Required columns:
   - Company Name
   - Contact Email
   - Phone Number
   - City
   - Province
   - Industry

**Uploading:**
1. From the Add Method Modal, select **"CSV Upload"**
2. Click **"Choose File"** or drag and drop your CSV
3. The system will validate your file
4. Review the preview of startups to be added
5. Click **"Upload"** to submit
6. Progress bar will show upload status
7. You'll receive a summary of:
   - Successfully added startups
   - Failed entries (with error messages)

**Tips for CSV Upload:**
- Ensure all required fields are filled
- Use proper date format (YYYY-MM-DD)
- Check for special characters in text fields
- Maximum 100 startups per upload

---

## Adding Stakeholders

Stakeholders are individuals or organizations connected to your startup (mentors, investors, partners, advisors, etc.).

### Step 1: Access Stakeholder Management

1. Login to your account
2. Navigate to your **Startup Dashboard**
3. Click on the startup you want to add stakeholders to
4. You'll see the **Startup Detail** page
5. Scroll to the **"Stakeholders"** section
6. Click **"Add Stakeholder"** button

### Step 2: Choose Stakeholder Source

A **Stakeholder Browser** modal will open with two options:

#### Option A: Select Existing Stakeholder

**Search and Browse:**
1. The browser shows all stakeholders in the database
2. Use the **search bar** to find stakeholders by:
   - Name
   - Email
   - Role
   - City
   - Province
3. **Filter options** help narrow results
4. Each stakeholder card shows:
   - Name and initials avatar
   - Email address
   - Phone number
   - Location
   - Current role

**Selecting:**
1. Click on a stakeholder card to select them
2. A **Role Assignment Modal** will appear
3. Choose the stakeholder's role in your startup:
   - Mentor
   - Investor
   - Advisor
   - Partner
   - Board Member
   - Consultant
   - Other (specify)
4. Select **Association Status**:
   - Active
   - Inactive
   - Pending
5. Click **"Associate Stakeholder"**
6. The stakeholder is now linked to your startup

**Note:** If the stakeholder is already associated with your startup, you'll see an indicator showing they're already connected.

#### Option B: Create New Stakeholder

If the person isn't in the database:

1. Click **"Create New Stakeholder"** button (User+ icon)
2. Fill out the stakeholder form:

**Personal Information:**
- **Full Name** *(required)* - Stakeholder's full name
- **Email** *(required)* - Professional email address
- **Phone Number** - Contact number
- **Organization** - Company/organization name (if applicable)

**Location Information:**
- **City** - Current city
- **Province** - Current province
- **Region** - Current region

**Professional Details:**
- **Role/Title** - Professional title
- **Expertise** - Areas of expertise or specialization
- **Bio** - Brief professional biography

**Contact Preferences:**
- Preferred contact method
- Availability
- LinkedIn profile

3. Click **"Create and Associate"**
4. The new stakeholder will be:
   - Added to the database
   - Automatically linked to your startup
   - Assigned the role you specified

### Step 3: Manage Stakeholder Associations

**View Associated Stakeholders:**
1. In your Startup Detail page, scroll to the **Stakeholders section**
2. You'll see all associated stakeholders with:
   - Name and avatar
   - Role in your startup
   - Contact information
   - Association status

**Edit Association:**
1. Click the **"Edit"** icon next to a stakeholder
2. Modify their role or status
3. Click **"Save Changes"**

**Remove Association:**
1. Click the **"Remove"** icon next to a stakeholder
2. Confirm the removal
3. This only removes the association, not the stakeholder from the database

**Contact Stakeholder:**
- Click the email or phone icon to initiate contact
- View their full profile by clicking their name

---

## Managing Your Dashboard

### Startup Dashboard Overview

**Metrics Section:**
- **Views** - Total views across all your startups
- **Likes** - Total likes/favorites
- **Bookmarks** - Times your startups were bookmarked

**Startup List:**
- View all your registered startups
- Each card shows:
  - Company logo
  - Company name
  - Industry
  - Location
  - Verification status
  - Quick actions (Edit, Delete, View)

**Filter Options:**
- **All** - Show all startups
- **Verified** - Only verified startups
- **Pending** - Awaiting verification
- **Draft** - Saved drafts

**Search:**
- Use the search bar to find specific startups by name or industry

### Editing Startups

1. Click the **Edit** icon on any startup card
2. You'll be taken to the **Update Startup** page
3. All form tabs will be available with pre-filled data
4. Make your changes
5. Click **"Save Changes"**
6. If significant changes are made, the startup may need re-verification

### Deleting Startups

1. Click the **Delete** icon on a startup card
2. A confirmation modal will appear
3. Confirm deletion
4. The startup will be permanently removed

### Managing Drafts

**View Drafts:**
- Drafts appear in a separate section or with a "Draft" badge
- Shows incomplete startup registrations

**Continue Draft:**
1. Click on the draft card
2. You'll return to the form where you left off
3. Complete the remaining information
4. Submit for verification

**Delete Draft:**
1. Click the delete icon on the draft
2. Confirm deletion
3. Draft is permanently removed

---

## Additional Features

### 3D Map Interaction

**Exploring the Map:**
- **Zoom** - Use scroll wheel or pinch gesture
- **Pan** - Click and drag to move around
- **Rotate** - Hold Ctrl/Cmd and drag to rotate view
- **Tilt** - Hold Shift and drag to tilt perspective

**Startup Markers:**
- Colored pins represent different industries
- Click a pin to view startup details
- Hover to see quick info popup

**Search on Map:**
- Use the search bar to find locations
- The map will zoom to the searched area
- Relevant startups will be highlighted

### Notifications

**Types of Notifications:**
- Verification status updates
- Stakeholder connection requests
- Comments or interactions on your startups
- System announcements

**Managing Notifications:**
1. Click the **Bell icon** in the sidebar
2. View all notifications
3. Click to view details
4. Mark as read or dismiss

### Bookmarks

**Bookmarking Startups:**
1. While viewing any startup detail
2. Click the **Bookmark icon**
3. The startup is saved to your bookmarks

**Viewing Bookmarks:**
1. Click **Bookmarks** in the sidebar
2. See all your saved startups
3. Click to view details
4. Remove by clicking the bookmark icon again

### Privacy & Security

**Data Protection:**
- All data is encrypted
- Secure authentication
- Regular security audits
- GDPR compliant

**Your Rights:**
- Access and download your data
- Request data deletion
- Modify information
- Opt-out of data sharing

**View Policy:**
- Click **"Privacy & Security"** on any form
- Read detailed privacy policy
- Understand data usage

---

## Troubleshooting

### Common Issues

**Can't Submit Startup:**
- Ensure all required fields (*) are filled
- Check email format is valid
- Verify phone number format
- Make sure location is selected on map

**Verification Email Not Received:**
- Check spam/junk folder
- Wait 5-10 minutes
- Request resend from verification modal
- Verify email address is correct

**Stakeholder Not Appearing:**
- Refresh the stakeholder browser
- Check search filters
- Ensure stakeholder exists in database
- Try searching by different criteria

**Upload Failed:**
- Check file size (max 5MB for images)
- Ensure file format is correct (PNG, JPG for images)
- Check internet connection
- Try again later

**Map Not Loading:**
- Check internet connection
- Refresh the page
- Clear browser cache
- Try different browser

### Getting Help

**Support Resources:**
- Email: support@startupsphere.com
- Documentation: Available in the Help section
- Contact admin through dashboard
- Report bugs through feedback form

---

## Best Practices

### For Startups:
1. **Complete All Information** - Fully completed profiles get more visibility
2. **Keep Data Updated** - Regularly update your startup information
3. **Add Multiple Stakeholders** - Build your network through the platform
4. **Engage with Community** - Like and bookmark other startups
5. **Upload Quality Images** - Use high-resolution logos

### For Stakeholders:
1. **Create Detailed Profile** - Help startups find you
2. **Keep Contact Info Current** - Ensure you receive communications
3. **Accept Associations Promptly** - Respond to connection requests
4. **Update Expertise Regularly** - Keep your skills list current

### Security Tips:
1. Use strong passwords
2. Enable two-factor authentication (if available)
3. Don't share login credentials
4. Log out from shared devices
5. Report suspicious activity

---

## Quick Reference

### Keyboard Shortcuts
- `Ctrl/Cmd + S` - Save draft
- `Escape` - Close modal
- `Ctrl/Cmd + F` - Search

### Important Links
- Terms and Conditions: `/terms-and-conditions`
- Privacy Policy: `/privacy-policy`
- Dashboard: `/startup-dashboard`
- Add Startup: `/add-startup`
- All Startups: `/all-startup-dashboard`

### Status Indicators
- 🟢 **Verified** - Fully verified startup
- 🟡 **Pending** - Awaiting verification
- 🔵 **Draft** - Incomplete registration
- 🔴 **Action Required** - Needs user attention

---

## Frequently Asked Questions

**Q: How long does verification take?**
A: Typically 1-3 business days after submission.

**Q: Can I edit after verification?**
A: Yes, but significant changes may require re-verification.

**Q: Is there a limit to stakeholders?**
A: No limit on stakeholder associations.

**Q: Can I add multiple startups?**
A: Yes, add as many startups as you manage.

**Q: Is the service free?**
A: Check pricing page for current plan details.

**Q: Can I export my data?**
A: Yes, contact support for data export.

---

*Last Updated: December 2025*
*Version: 2.0*
