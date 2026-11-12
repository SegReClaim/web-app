# SegReClaim

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Recyclers deposit materials at SegReClaim machines and use earned points for partner rewards. Administrators inspect users and activity and manage partners and rewards. Superadmins manage admin roles.

## Product Purpose

Connect recycling deposits, points, and reward claims to a traceable user history.

## Capabilities and Constraints

The existing implementation uses Next.js, React, Firebase Authentication, Firestore, and Cloud Functions. Machine transactions award points; issued vouchers spend them. Anonymous donations have no user account. Historical data includes more than one transaction schema.

The requested admin extension includes transaction history, trash deposits, reward claims, and user histories. The existing UI design must be preserved. Realistic Indian demo profiles and linked activity must remain isolated from production data.

## Brand Commitments

Retain the SegReClaim name, existing logo, and established UI designs. The user explicitly requested that additions blend in.

## Evidence on Hand

The existing application and sibling Firebase backend define the current workflows and data schemas. Demo records are illustrative and do not establish actual user activity or recycling impact.
