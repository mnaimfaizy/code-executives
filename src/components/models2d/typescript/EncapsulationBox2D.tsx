import React, { useState, useCallback } from 'react';

export interface ClassMember {
  name: string;
  type: 'property' | 'method';
  visibility: 'public' | 'private' | 'protected';
  value?: string;
  signature?: string;
}

export interface EncapsulationClass {
  name: string;
  publicMembers: ClassMember[];
  privateMembers: ClassMember[];
  protectedMembers: ClassMember[];
}

export interface EncapsulationBox2DProps {
  classData: EncapsulationClass;
  width?: number;
  height?: number;
  showProtected?: boolean;
}

export interface EncapsulationBox2DHandle {
  toggleVisibility(visibility: 'public' | 'private' | 'protected'): void;
  highlightMember(memberName: string): void;
  reset(): void;
}

const EncapsulationBox2D = React.forwardRef<EncapsulationBox2DHandle, EncapsulationBox2DProps>(
  ({ classData, width = 800, height = 600, showProtected = true }, ref) => {
    const [visibleSections, setVisibleSections] = useState({
      public: true,
      private: false,
      protected: showProtected,
    });
    const [highlightedMember, setHighlightedMember] = useState<string | null>(null);
    const [animating, setAnimating] = useState(false);

    const toggleVisibility = useCallback(
      (visibility: 'public' | 'private' | 'protected') => {
        setVisibleSections((prev) => ({
          ...prev,
          [visibility]: !prev[visibility],
        }));

        if (!animating) {
          setAnimating(true);
          setTimeout(() => setAnimating(false), 500);
        }
      },
      [animating]
    );

    const highlightMember = useCallback((memberName: string) => {
      setHighlightedMember(memberName);
      setTimeout(() => setHighlightedMember(null), 2000);
    }, []);

    React.useImperativeHandle(ref, () => ({
      toggleVisibility,
      highlightMember,
      reset: () => {
        setVisibleSections({
          public: true,
          private: false,
          protected: showProtected,
        });
        setHighlightedMember(null);
        setAnimating(false);
      },
    }));

    const getVisibilityColor = (visibility: 'public' | 'private' | 'protected') => {
      switch (visibility) {
        case 'public':
          return '#10B981';
        case 'private':
          return '#EF4444';
        case 'protected':
          return '#F59E0B';
        default:
          return '#6B7280';
      }
    };

    const getVisibilityIcon = (visibility: 'public' | 'private' | 'protected') => {
      switch (visibility) {
        case 'public':
          return '🌐';
        case 'private':
          return '🔒';
        case 'protected':
          return '🛡️';
        default:
          return '❓';
      }
    };

    const renderMember = (member: ClassMember, index: number, sectionY: number) => {
      const isVisible = visibleSections[member.visibility];
      const isHighlighted = highlightedMember === member.name;
      const y = sectionY + 40 + index * 30;

      return (
        <g
          key={member.name}
          style={{
            opacity: isVisible ? 1 : 0.3,
            transition: 'opacity 0.5s ease-in-out',
          }}
        >
          {/* Member background */}
          <rect
            x="40"
            y={y - 12}
            width="320"
            height="24"
            rx="6"
            fill={isHighlighted ? '#FEF3C7' : 'transparent'}
            stroke={isHighlighted ? getVisibilityColor(member.visibility) : 'transparent'}
            strokeWidth="2"
          />

          {/* Visibility indicator */}
          <circle
            cx="55"
            cy={y}
            r="8"
            fill={getVisibilityColor(member.visibility)}
            style={{ cursor: 'pointer' }}
            onClick={() => toggleVisibility(member.visibility)}
          />
          <text
            x="55"
            y={y + 4}
            textAnchor="middle"
            fill="white"
            fontSize="10"
            fontWeight="bold"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleVisibility(member.visibility)}
          >
            {getVisibilityIcon(member.visibility)}
          </text>

          {/* Member info */}
          <text
            x="75"
            y={y + 2}
            fill="#374151"
            fontSize="12"
            style={{ cursor: 'pointer' }}
            onClick={() => highlightMember(member.name)}
          >
            <tspan fontWeight="bold">{member.name}</tspan>
            {member.type === 'property' && member.value && (
              <tspan fontSize="10" fill="#6B7280">
                : {member.value}
              </tspan>
            )}
            {member.type === 'method' && member.signature && (
              <tspan fontSize="10" fill="#6B7280">
                {member.signature}
              </tspan>
            )}
          </text>

          {/* Type indicator */}
          <text x="350" y={y + 2} fill="#6B7280" fontSize="10" textAnchor="end">
            {member.type === 'property' ? '🔹' : '📋'}
          </text>
        </g>
      );
    };

    const renderSection = (
      title: string,
      members: ClassMember[],
      visibility: 'public' | 'private' | 'protected',
      startY: number
    ) => {
      const isVisible = visibleSections[visibility];
      const sectionHeight = 60 + members.length * 30;

      return (
        <g key={visibility}>
          {/* Section background */}
          <rect
            x="20"
            y={startY}
            width="360"
            height={sectionHeight}
            rx="12"
            fill={isVisible ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)'}
            stroke={getVisibilityColor(visibility)}
            strokeWidth={isVisible ? '3' : '2'}
            strokeDasharray={isVisible ? 'none' : '5,5'}
            style={{
              filter: isVisible ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' : 'none',
              transition: 'all 0.5s ease-in-out',
            }}
          />

          {/* Section header */}
          <rect
            x="20"
            y={startY}
            width="360"
            height="35"
            rx="12"
            fill={getVisibilityColor(visibility)}
          />
          <text x="40" y={startY + 23} fill="white" fontSize="14" fontWeight="bold">
            {getVisibilityIcon(visibility)} {title}
          </text>

          {/* Toggle button */}
          <text
            x="360"
            y={startY + 23}
            fill="white"
            fontSize="12"
            textAnchor="end"
            style={{ cursor: 'pointer' }}
            onClick={() => toggleVisibility(visibility)}
          >
            {isVisible ? '👁️' : '🙈'}
          </text>

          {/* Section members */}
          {members.map((member, index) => renderMember(member, index, startY))}

          {/* Section info */}
          <text
            x="200"
            y={startY + sectionHeight - 10}
            textAnchor="middle"
            fill="#6B7280"
            fontSize="10"
          >
            {members.length} {visibility} member{members.length !== 1 ? 's' : ''}
          </text>
        </g>
      );
    };

    const sections = [
      {
        title: 'Public Interface',
        members: classData.publicMembers,
        visibility: 'public' as const,
        startY: 80,
      },
      {
        title: 'Protected Members',
        members: classData.protectedMembers,
        visibility: 'protected' as const,
        startY: 200,
      },
      {
        title: 'Private Implementation',
        members: classData.privateMembers,
        visibility: 'private' as const,
        startY: 320,
      },
    ];

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '0.75rem',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
      >
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            color: 'white',
            fontSize: '18px',
            fontWeight: 'bold',
            zIndex: 10,
          }}
        >
          🔐 Data Encapsulation
        </div>

        {/* Class name */}
        <div
          style={{
            position: 'absolute',
            top: '50px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '20px',
            padding: '8px 16px',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#6366F1',
            zIndex: 10,
          }}
        >
          📦 {classData.name}
        </div>

        {/* Legend */}
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.9)',
            borderRadius: '8px',
            padding: '8px',
            fontSize: '11px',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span>🌐</span>
            <span>Public</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span>🛡️</span>
            <span>Protected</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>🔒</span>
            <span>Private</span>
          </div>
        </div>

        {/* Control buttons */}
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '8px',
            zIndex: 10,
          }}
        >
          <button
            onClick={() => toggleVisibility('public')}
            style={{
              padding: '6px 12px',
              backgroundColor: visibleSections.public ? '#10B981' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            🌐 Public
          </button>
          {showProtected && (
            <button
              onClick={() => toggleVisibility('protected')}
              style={{
                padding: '6px 12px',
                backgroundColor: visibleSections.protected ? '#F59E0B' : '#9CA3AF',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🛡️ Protected
            </button>
          )}
          <button
            onClick={() => toggleVisibility('private')}
            style={{
              padding: '6px 12px',
              backgroundColor: visibleSections.private ? '#EF4444' : '#9CA3AF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 'bold',
              cursor: 'pointer',
              opacity: visibleSections.private ? 1 : 0.7,
            }}
          >
            🔒 Private
          </button>
        </div>

        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
        >
          {/* Background pattern */}
          <defs>
            <pattern id="encapsulation-grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path
                d="M 20 0 L 0 0 0 20"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#encapsulation-grid)" />

          {/* Main container box */}
          <rect
            x="10"
            y="60"
            width="380"
            height="480"
            rx="20"
            fill="rgba(255,255,255,0.1)"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />

          {/* Render sections */}
          {sections.map((section) =>
            renderSection(section.title, section.members, section.visibility, section.startY)
          )}

          {/* Encapsulation concept visualization */}
          <g transform="translate(450, 200)">
            {/* Outer public interface */}
            <circle
              cx="0"
              cy="0"
              r="80"
              fill="none"
              stroke="#10B981"
              strokeWidth="3"
              opacity="0.7"
            />
            <text x="0" y="-90" textAnchor="middle" fill="#10B981" fontSize="12" fontWeight="bold">
              Public API
            </text>

            {/* Protected layer */}
            {showProtected && (
              <>
                <circle
                  cx="0"
                  cy="0"
                  r="60"
                  fill="none"
                  stroke="#F59E0B"
                  strokeWidth="3"
                  opacity={visibleSections.protected ? '0.7' : '0.3'}
                />
                <text
                  x="0"
                  y="-70"
                  textAnchor="middle"
                  fill="#F59E0B"
                  fontSize="12"
                  fontWeight="bold"
                  opacity={visibleSections.protected ? '1' : '0.5'}
                >
                  Protected
                </text>
              </>
            )}

            {/* Private core */}
            <circle
              cx="0"
              cy="0"
              r="40"
              fill={visibleSections.private ? '#EF4444' : 'rgba(239, 68, 68, 0.3)'}
              stroke="#EF4444"
              strokeWidth="3"
              opacity={visibleSections.private ? '0.7' : '0.3'}
            />
            <text
              x="0"
              y="-50"
              textAnchor="middle"
              fill="#EF4444"
              fontSize="12"
              fontWeight="bold"
              opacity={visibleSections.private ? '1' : '0.5'}
            >
              Private Data
            </text>

            {/* Center object */}
            <circle cx="0" cy="0" r="15" fill="#6366F1" />
            <text x="0" y="4" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
              📦
            </text>
          </g>
        </svg>
      </div>
    );
  }
);

export default EncapsulationBox2D;
