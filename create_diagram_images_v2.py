"""
create_diagram_images_v2.py
Generates publication-quality academic diagram images formatted in Times New Roman:
1. System Architecture (system_architecture_diagram.png)
2. UML Class Diagram (uml_class_diagram.png)
3. UML Sequence Diagram (uml_sequence_diagram.png)
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

# Configure global font family to Times New Roman
plt.rcParams['font.family'] = 'serif'
plt.rcParams['font.serif'] = ['Times New Roman', 'DejaVu Serif', 'serif']

def generate_system_architecture():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    # Main Title
    ax.text(50, 96.5, "SMART URBAN GREEN MANAGEMENT SYSTEM - 3-TIER ARCHITECTURE",
            ha='center', va='center', fontsize=12.5, fontweight='bold', fontfamily='serif', color='#0f172a')

    # Tier 1: Client Presentation Layer
    t1 = patches.FancyBboxPatch((4, 67), 92, 25, boxstyle="round,pad=1.2",
                                facecolor="#f0fdf4", edgecolor="#10b981", linewidth=2.0)
    ax.add_patch(t1)
    ax.text(7, 88.5, "TIER 1: CLIENT PRESENTATION LAYER (BROWSER - REACT.JS 18)",
            fontsize=10.5, fontweight='bold', fontfamily='serif', color='#065f46')

    sub_t1 = [
        ("Citizen Portal\n• Park Directory\n• Crowdsourced Issue Form\n• Geolocation Auto-Detect", 6, 70, 27, 15, "#d1fae5"),
        ("Admin Command Center\n• Park Boundary Manager\n• Incident Triage Queue\n• Canopy & Carbon KPIs", 36.5, 70, 27, 15, "#d1fae5"),
        ("3D Twin & GIS Viewports\n• Three.js WebGL Engine\n• Procedural Canopy Shaders\n• Leaflet Tile Layers", 67, 70, 27, 15, "#d1fae5")
    ]
    for text, x, y, w, h, bg in sub_t1:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6",
                                   facecolor=bg, edgecolor="#059669", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + 1.2, y + h - 2.5, text.split('\n')[0], fontsize=8.5, fontweight='bold', fontfamily='serif', color='#064e3b')
        lines = text.split('\n')[1:]
        for idx, line in enumerate(lines):
            ax.text(x + 1.5, y + h - 5.5 - (idx * 3.2), line, fontsize=7.5, fontfamily='serif', color='#064e3b')

    # Arrow 1 -> 2
    ax.annotate("", xy=(50, 61), xytext=(50, 66.5),
                arrowprops=dict(arrowstyle="<->", lw=2.2, color="#047857"))
    ax.text(51.5, 63.8, "HTTPS / REST JSON API / Bearer JWT Authentication",
            fontsize=8.5, fontfamily='serif', fontweight='bold', color='#047857')

    # Tier 2: Application / Business Logic Layer
    t2 = patches.FancyBboxPatch((4, 35), 92, 25, boxstyle="round,pad=1.2",
                                facecolor="#eff6ff", edgecolor="#3b82f6", linewidth=2.0)
    ax.add_patch(t2)
    ax.text(7, 56.5, "TIER 2: APPLICATION & BUSINESS LOGIC LAYER (NODE.JS / EXPRESS.JS)",
            fontsize=10.5, fontweight='bold', fontfamily='serif', color='#1e40af')

    sub_t2 = [
        ("Security & Auth Gateway\n• authMiddleware (JWT verify)\n• bcrypt Password Salt (x10)\n• Role Authorization (RBAC)", 6, 38, 27, 15, "#dbeafe"),
        ("REST API Controllers\n• greenSpaceController\n• floraController\n• issueController", 36.5, 38, 27, 15, "#dbeafe"),
        ("Computational Services\n• GeoJSON Boundary Engine\n• Tree Biomass & Carbon Math\n• Incident Dispatch Router", 67, 38, 27, 15, "#dbeafe")
    ]
    for text, x, y, w, h, bg in sub_t2:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.6",
                                   facecolor=bg, edgecolor="#2563eb", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + 1.2, y + h - 2.5, text.split('\n')[0], fontsize=8.5, fontweight='bold', fontfamily='serif', color='#1e3a8a')
        lines = text.split('\n')[1:]
        for idx, line in enumerate(lines):
            ax.text(x + 1.5, y + h - 5.5 - (idx * 3.2), line, fontsize=7.5, fontfamily='serif', color='#1e3a8a')

    # Arrow 2 -> 3
    ax.annotate("", xy=(50, 29), xytext=(50, 34.5),
                arrowprops=dict(arrowstyle="<->", lw=2.2, color="#1d4ed8"))
    ax.text(51.5, 31.8, "Mongoose ODM / TCP Socket Connection (Port 27017)",
            fontsize=8.5, fontfamily='serif', fontweight='bold', color='#1d4ed8')

    # Tier 3: Data Layer
    t3 = patches.FancyBboxPatch((4, 4), 92, 24, boxstyle="round,pad=1.2",
                                facecolor="#fefce8", edgecolor="#ca8a04", linewidth=2.0)
    ax.add_patch(t3)
    ax.text(7, 24.5, "TIER 3: DATA PERSISTENCE LAYER (MONGODB COMMUNITY SERVER v8.2.6)",
            fontsize=10.5, fontweight='bold', fontfamily='serif', color='#854d0e')

    sub_t3 = [
        ("Users Collection\n• _id, name, email\n• passwordHash, role\n• createdAt", 6, 7, 20.5, 14, "#fef9c3"),
        ("GreenSpaces Store\n• GeoJSON 2dsphere\n• areaSquareMeters\n• facilities, createdBy", 29.5, 7, 20.5, 14, "#fef9c3"),
        ("Flora Collection\n• common/scientificName\n• healthStatus, height\n• crownDiameter, color", 53, 7, 20.5, 14, "#fef9c3"),
        ("Issues Collection\n• category, priority\n• location lat/long\n• status, adminNotes", 75.5, 7, 20.5, 14, "#fef9c3")
    ]
    for text, x, y, w, h, bg in sub_t3:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5",
                                   facecolor=bg, edgecolor="#ca8a04", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + 1.2, y + h - 2.5, text.split('\n')[0], fontsize=8.2, fontweight='bold', fontfamily='serif', color='#713f12')
        lines = text.split('\n')[1:]
        for idx, line in enumerate(lines):
            ax.text(x + 1.5, y + h - 5.5 - (idx * 2.8), line, fontsize=7.2, fontfamily='serif', color='#713f12')

    plt.tight_layout()
    plt.savefig('d:/fsd/system_architecture_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated d:/fsd/system_architecture_diagram.png")

def generate_class_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(50, 96.5, "UML CLASS DIAGRAM: STRUCTURAL ENTITIES & RELATIONSHIPS",
            ha='center', va='center', fontsize=12.5, fontweight='bold', fontfamily='serif', color='#0f172a')

    classes = [
        ("User", 4, 54, 43, 37, [
            "- _id: ObjectId",
            "- name: String",
            "- email: String [unique]",
            "- passwordHash: String",
            "- role: String ['citizen','admin']",
            "- createdAt: Date"
        ], [
            "+ register(): Promise<Token>",
            "+ comparePassword(pwd): Boolean",
            "+ generateJWTToken(): String"
        ]),
        ("GreenSpace", 53, 54, 43, 37, [
            "- _id: ObjectId",
            "- name: String",
            "- type: String ['Park','Garden']",
            "- areaSquareMeters: Number",
            "- location: GeoJSON Point/Polygon",
            "- facilities: Array<String>"
        ], [
            "+ calculateCanopyDensity(): Number",
            "+ getNearbyGreenSpaces(): Array",
            "+ addFloraRecord(floraId): Void"
        ]),
        ("Issue", 4, 6, 43, 40, [
            "- _id: ObjectId",
            "- title: String",
            "- description: String",
            "- category: String ['Felling',...]",
            "- status: String ['Reported',...]",
            "- reportedBy: ObjectId (User)",
            "- greenSpaceId: ObjectId"
        ], [
            "+ updateStatus(newStatus): Void",
            "+ attachPhotoEvidence(url): Void",
            "+ recordAdminNote(notes): Void"
        ]),
        ("Flora", 53, 6, 43, 40, [
            "- _id: ObjectId",
            "- commonName: String",
            "- scientificName: String",
            "- healthStatus: String ['Healthy',...]",
            "- heightMeters: Number",
            "- crownDiameter: Number",
            "- canopyColor: String"
        ], [
            "+ render3DDigitalTwin(): Canvas",
            "+ estimateCarbonOffset(): Number",
            "+ updateHealthRating(val): Void"
        ])
    ]

    for title, x, y, w, h, attrs, methods in classes:
        # Outer box
        rect = patches.Rectangle((x, y), w, h, facecolor="#ffffff", edgecolor="#1e293b", linewidth=1.5)
        ax.add_patch(rect)
        # Header compartment
        header = patches.Rectangle((x, y + h - 6), w, 6, facecolor="#f1f5f9", edgecolor="#1e293b", linewidth=1.5)
        ax.add_patch(header)
        ax.text(x + w/2, y + h - 3.2, title, ha='center', va='center', fontsize=10, fontweight='bold', fontfamily='serif', color='#0f172a')

        # Attributes compartment
        curr_y = y + h - 8.5
        for attr in attrs:
            ax.text(x + 2, curr_y, attr, fontsize=7.8, fontfamily='Courier New', color='#1e293b')
            curr_y -= 3.3

        # Divider line
        div_y = y + 12
        ax.plot([x, x + w], [div_y, div_y], color="#1e293b", lw=1.2)

        # Methods compartment
        curr_y = div_y - 3.2
        for m in methods:
            ax.text(x + 2, curr_y, m, fontsize=7.8, fontfamily='Courier New', color='#0f766e')
            curr_y -= 3.3

    # Relationships
    # User to Issue (1 reports *)
    ax.annotate("", xy=(25, 46.5), xytext=(25, 53.5),
                arrowprops=dict(arrowstyle="->", lw=1.6, color="#0f172a"))
    ax.text(26.5, 50, "1 reports *", fontsize=8.5, fontfamily='serif', fontweight='bold', color='#0f172a')

    # GreenSpace to Flora (1 contains *)
    ax.annotate("", xy=(74, 46.5), xytext=(74, 53.5),
                arrowprops=dict(arrowstyle="->", lw=1.6, color="#0f172a"))
    ax.text(75.5, 50, "1 contains *", fontsize=8.5, fontfamily='serif', fontweight='bold', color='#0f172a')

    # User to GreenSpace (1 manages *)
    ax.annotate("", xy=(52.5, 72), xytext=(47.5, 72),
                arrowprops=dict(arrowstyle="->", lw=1.6, color="#0f172a"))
    ax.text(48.2, 74, "manages", fontsize=8, fontfamily='serif', color='#0f172a')

    # Issue to GreenSpace (* references 1)
    ax.annotate("", xy=(52.5, 26), xytext=(47.5, 26),
                arrowprops=dict(arrowstyle="->", lw=1.6, color="#0f172a"))
    ax.text(47.5, 28, "* references 1", fontsize=8, fontfamily='serif', color='#0f172a')

    plt.tight_layout()
    plt.savefig('d:/fsd/uml_class_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated d:/fsd/uml_class_diagram.png")

def generate_sequence_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(50, 96.5, "UML SEQUENCE DIAGRAM: CITIZEN REPORTING & ADMINISTRATIVE TRIAGE",
            ha='center', va='center', fontsize=11.5, fontweight='bold', fontfamily='serif', color='#0f172a')

    actors = [
        ("Citizen\n(User)", 12),
        ("React UI\n(Client)", 37),
        ("Express Gateway\n(Backend)", 63),
        ("MongoDB Store\n(Persistence)", 88)
    ]

    for label, x in actors:
        # Box
        p = patches.FancyBboxPatch((x - 9.5, 84), 19, 9, boxstyle="round,pad=0.3",
                                   facecolor="#e0e7ff", edgecolor="#4338ca", linewidth=1.3)
        ax.add_patch(p)
        ax.text(x, 88.5, label, ha='center', va='center', fontsize=8.2, fontfamily='serif', fontweight='bold', color='#312e81')
        # Lifeline
        ax.plot([x, x], [84, 7], color="#94a3b8", linestyle="--", lw=1.2)

    # Lifeline activation bars
    activations = [
        (37, 78, 35), # React UI active
        (63, 71, 41), # Backend active
        (88, 58, 48), # DB active
        (63, 29, 13), # Backend update active
        (88, 28, 20), # DB update active
    ]
    for x, y_top, y_bot in activations:
        bar = patches.Rectangle((x - 1, y_bot), 2, y_top - y_bot,
                                facecolor="#cbd5e1", edgecolor="#64748b", lw=0.8)
        ax.add_patch(bar)

    # Messages
    steps = [
        (12, 37, 78, "1. Submits Issue Form with GPS & Photo", "->"),
        (37, 63, 71, "2. POST /api/issues {Payload, JWT}", "->"),
        (63, 63, 64, "3. authMiddleware validates JWT & claims", "self"),
        (63, 88, 57, "4. Issue.create({title, location, user})", "->"),
        (88, 63, 50, "5. Returns created document & _id", "-->"),
        (63, 37, 43, "6. HTTP 201 Created {success: true}", "-->"),
        (37, 12, 36, "7. Renders Confirmation Notification", "-->"),
        (63, 88, 28, "8. Admin updates status to 'Resolved'", "->"),
        (88, 63, 21, "9. Issue.findByIdAndUpdate() committed", "-->"),
        (63, 37, 14, "10. Broadcasts live resolution state", "-->")
    ]

    for x1, x2, y, msg, arrow_type in steps:
        if arrow_type == "self":
            ax.plot([x1, x1 + 6, x1 + 6, x1], [y + 2, y + 2, y - 2, y - 2], color="#0284c7", lw=1.3)
            ax.annotate("", xy=(x1, y - 2), xytext=(x1 + 1, y - 2),
                        arrowprops=dict(arrowstyle="->", lw=1.3, color="#0284c7"))
            ax.text(x1 + 7, y, msg, fontsize=7.5, fontfamily='serif', color='#0369a1')
        else:
            style = "->" if arrow_type == "->" else "->"
            ls = "-" if arrow_type == "->" else "--"
            ax.annotate("", xy=(x2, y), xytext=(x1, y),
                        arrowprops=dict(arrowstyle=style, linestyle=ls, lw=1.3, color="#0f172a"))
            mid_x = (x1 + x2) / 2
            ax.text(mid_x, y + 1.5, msg, ha='center', va='bottom', fontsize=7.5, fontfamily='serif', color='#0f172a')

    plt.tight_layout()
    plt.savefig('d:/fsd/uml_sequence_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Regenerated d:/fsd/uml_sequence_diagram.png")

if __name__ == "__main__":
    generate_system_architecture()
    generate_class_diagram()
    generate_sequence_diagram()
