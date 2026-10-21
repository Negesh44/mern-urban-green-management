"""
create_diagram_images.py
Generates high-resolution academic diagram images for:
1. System Architecture (system_architecture_diagram.png)
2. UML Class Diagram (uml_class_diagram.png)
3. UML Sequence Diagram (uml_sequence_diagram.png)
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as patches

def generate_system_architecture():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Background
    fig.patch.set_facecolor('#ffffff')

    # Title
    ax.text(50, 96, "SMART URBAN GREEN MANAGEMENT SYSTEM - 3-TIER ARCHITECTURE",
            ha='center', va='center', fontsize=12, fontweight='bold', fontfamily='serif')

    # Tier 1: Presentation Layer
    tier1 = patches.FancyBboxPatch((5, 68), 90, 24, boxstyle="round,pad=1",
                                   facecolor="#f0fdf4", edgecolor="#10b981", linewidth=2)
    ax.add_patch(tier1)
    ax.text(8, 89, "CLIENT PRESENTATION LAYER (BROWSER / REACT 18)", fontsize=10, fontweight='bold', fontfamily='serif', color='#065f46')

    # Sub-boxes in Tier 1
    boxes_t1 = [
        ("Citizen Portal\n(Incident Form, Park Map)", 8, 71, 26, 15, '#d1fae5'),
        ("Admin Command Center\n(Triage Board, CRUD)", 37, 71, 26, 15, '#d1fae5'),
        ("Three.js 3D Engine &\nLeaflet GIS Viewports", 66, 71, 26, 15, '#d1fae5')
    ]
    for text, x, y, w, h, bg in boxes_t1:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5", facecolor=bg, edgecolor="#059669", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8.5, fontfamily='serif', fontweight='bold', color='#064e3b')

    # Arrow 1 to 2
    ax.annotate("", xy=(50, 62), xytext=(50, 67),
                arrowprops=dict(arrowstyle="<->", lw=2, color="#047857"))
    ax.text(52, 64.5, "HTTPS / REST JSON API / JWT Bearer", fontsize=8.5, fontfamily='serif', color='#047857', fontweight='bold')

    # Tier 2: Application / Logic Layer
    tier2 = patches.FancyBboxPatch((5, 36), 90, 25, boxstyle="round,pad=1",
                                   facecolor="#eff6ff", edgecolor="#3b82f6", linewidth=2)
    ax.add_patch(tier2)
    ax.text(8, 58, "APPLICATION & BUSINESS LOGIC LAYER (NODE.JS / EXPRESS.JS)", fontsize=10, fontweight='bold', fontfamily='serif', color='#1e40af')

    boxes_t2 = [
        ("Auth & Security Middleware\n(JWT, bcrypt, RBAC)", 8, 39, 26, 16, '#dbeafe'),
        ("REST Controllers\n(GreenSpace, Flora, Issues)", 37, 39, 26, 16, '#dbeafe'),
        ("Geospatial & 3D Processors\n(GeoJSON, Biomass Math)", 66, 39, 26, 16, '#dbeafe')
    ]
    for text, x, y, w, h, bg in boxes_t2:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5", facecolor=bg, edgecolor="#2563eb", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8.5, fontfamily='serif', fontweight='bold', color='#1e3a8a')

    # Arrow 2 to 3
    ax.annotate("", xy=(50, 30), xytext=(50, 35),
                arrowprops=dict(arrowstyle="<->", lw=2, color="#1d4ed8"))
    ax.text(52, 32.5, "Mongoose ODM / TCP Socket 27017", fontsize=8.5, fontfamily='serif', color='#1d4ed8', fontweight='bold')

    # Tier 3: Data Layer
    tier3 = patches.FancyBboxPatch((5, 5), 90, 24, boxstyle="round,pad=1",
                                   facecolor="#fefce8", edgecolor="#eab308", linewidth=2)
    ax.add_patch(tier3)
    ax.text(8, 26, "DATA PERSISTENCE LAYER (MONGODB COMMUNITY SERVER v8.2.6)", fontsize=10, fontweight='bold', fontfamily='serif', color='#854d0e')

    boxes_t3 = [
        ("Users Collection\n(Role, Hash, Auth)", 8, 8, 20, 15, '#fef9c3'),
        ("GreenSpaces Collection\n(2dsphere, Polygons)", 30, 8, 20, 15, '#fef9c3'),
        ("Flora Collection\n(3D Canopy Params)", 52, 8, 20, 15, '#fef9c3'),
        ("Issues Collection\n(Incident Workflows)", 74, 8, 20, 15, '#fef9c3')
    ]
    for text, x, y, w, h, bg in boxes_t3:
        p = patches.FancyBboxPatch((x, y), w, h, boxstyle="round,pad=0.5", facecolor=bg, edgecolor="#ca8a04", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x + w/2, y + h/2, text, ha='center', va='center', fontsize=8, fontfamily='serif', fontweight='bold', color='#713f12')

    plt.tight_layout()
    plt.savefig('d:/fsd/system_architecture_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Saved d:/fsd/system_architecture_diagram.png")

def generate_class_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(50, 96, "UML CLASS DIAGRAM & ENTITY RELATIONSHIPS",
            ha='center', va='center', fontsize=12, fontweight='bold', fontfamily='serif')

    classes = [
        ("User", 5, 55, 42, 35, [
            "- _id: ObjectId",
            "- name: String",
            "- email: String [unique]",
            "- passwordHash: String",
            "- role: String ['citizen','admin']",
            "- createdAt: Date"
        ], [
            "+ register(): Promise<Token>",
            "+ comparePassword(): Boolean"
        ]),
        ("GreenSpace", 53, 55, 42, 35, [
            "- _id: ObjectId",
            "- name: String",
            "- type: String ['Park','Garden']",
            "- areaSquareMeters: Number",
            "- location: GeoJSON [2dsphere]",
            "- facilities: Array<String>"
        ], [
            "+ calculateCanopyDensity(): Number",
            "+ getNearbyGreenSpaces(): Array"
        ]),
        ("Issue", 5, 8, 42, 38, [
            "- _id: ObjectId",
            "- title: String",
            "- description: String",
            "- category: String",
            "- status: String ['Reported',...]",
            "- reportedBy: ObjectId (User)",
            "- greenSpaceId: ObjectId"
        ], [
            "+ updateStatus(status): Void",
            "+ addAdminNote(note): Void"
        ]),
        ("Flora", 53, 8, 42, 38, [
            "- _id: ObjectId",
            "- commonName: String",
            "- scientificName: String",
            "- healthStatus: String",
            "- heightMeters: Number",
            "- crownDiameter: Number",
            "- canopyColor: String"
        ], [
            "+ render3DDigitalTwin(): Canvas",
            "+ calculateBiomass(): Number"
        ])
    ]

    for title, x, y, w, h, attrs, methods in classes:
        # Outer box
        rect = patches.Rectangle((x, y), w, h, facecolor="#f8fafc", edgecolor="#334155", linewidth=1.5)
        ax.add_patch(rect)
        # Header
        header = patches.Rectangle((x, y + h - 6), w, 6, facecolor="#e2e8f0", edgecolor="#334155", linewidth=1.5)
        ax.add_patch(header)
        ax.text(x + w/2, y + h - 3, title, ha='center', va='center', fontsize=9.5, fontweight='bold', fontfamily='serif')

        # Attributes
        curr_y = y + h - 8
        for attr in attrs:
            ax.text(x + 1.5, curr_y, attr, fontsize=7.5, fontfamily='Courier New')
            curr_y -= 3.2

        # Divider line
        ax.plot([x, x + w], [y + 11, y + 11], color="#334155", lw=1)

        # Methods
        curr_y = y + 8
        for m in methods:
            ax.text(x + 1.5, curr_y, m, fontsize=7.5, fontfamily='Courier New', color='#0f766e')
            curr_y -= 3.2

    # Relationship connectors
    # User to Issue (1 to *)
    ax.annotate("", xy=(26, 46.5), xytext=(26, 54.5),
                arrowprops=dict(arrowstyle="->", lw=1.5, color="#1e293b"))
    ax.text(28, 50, "1 reports *", fontsize=8, fontfamily='serif', fontweight='bold')

    # GreenSpace to Flora (1 to *)
    ax.annotate("", xy=(74, 46.5), xytext=(74, 54.5),
                arrowprops=dict(arrowstyle="->", lw=1.5, color="#1e293b"))
    ax.text(76, 50, "1 contains *", fontsize=8, fontfamily='serif', fontweight='bold')

    # User to GreenSpace (1 manages *)
    ax.annotate("", xy=(52.5, 72), xytext=(47.5, 72),
                arrowprops=dict(arrowstyle="->", lw=1.5, color="#1e293b"))
    ax.text(48, 74, "manages", fontsize=7.5, fontfamily='serif')

    plt.tight_layout()
    plt.savefig('d:/fsd/uml_class_diagram.png', dpi=300, bbox_inches='tight')
    plt.close()
    print("Saved d:/fsd/uml_class_diagram.png")

def generate_sequence_diagram():
    fig, ax = plt.subplots(figsize=(10, 6.5), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    fig.patch.set_facecolor('#ffffff')

    ax.text(50, 96, "UML SEQUENCE DIAGRAM: CITIZEN REPORTING & TRIAGE WORKFLOW",
            ha='center', va='center', fontsize=11, fontweight='bold', fontfamily='serif')

    actors = [
        ("Citizen\nUser", 12),
        ("React Client\n(Browser)", 35),
        ("Express Gateway\n(Node.js)", 60),
        ("MongoDB Store\n(Database)", 85)
    ]

    for label, x in actors:
        # Box
        p = patches.FancyBboxPatch((x - 9, 84), 18, 9, boxstyle="round,pad=0.3",
                                   facecolor="#e0e7ff", edgecolor="#4338ca", linewidth=1.2)
        ax.add_patch(p)
        ax.text(x, 88.5, label, ha='center', va='center', fontsize=8, fontfamily='serif', fontweight='bold', color='#312e81')
        # Lifeline
        ax.plot([x, x], [84, 8], color="#94a3b8", linestyle="--", lw=1.2)

    # Sequence Messages
    steps = [
        (12, 35, 78, "1. Fills Issue Form & Attaches GPS Photo", "->"),
        (35, 60, 71, "2. POST /api/issues {payload, JWT}", "->"),
        (60, 60, 64, "3. authMiddleware verifies JWT token", "self"),
        (60, 85, 57, "4. Issue.create({data, user: id})", "->"),
        (85, 60, 50, "5. Returns created document & _id", "-->"),
        (60, 35, 43, "6. HTTP 201 Created {success: true}", "-->"),
        (35, 12, 36, "7. Displays toast: 'Issue Logged'", "-->"),
        (60, 85, 29, "8. Admin updates status to 'Resolved'", "->"),
        (85, 60, 22, "9. Issue.findByIdAndUpdate() committed", "-->"),
        (60, 35, 15, "10. Broadcasts live resolution status", "-->")
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
    print("Saved d:/fsd/uml_sequence_diagram.png")

if __name__ == "__main__":
    generate_system_architecture()
    generate_class_diagram()
    generate_sequence_diagram()
